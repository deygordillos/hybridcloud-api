import { OrdersRepository } from "../repositories/OrdersRepository";
import { OrderItemsRepository } from "../repositories/OrderItemsRepository";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { AuditLogsRepository } from "../repositories/AuditLogsRepository";
import { appDataSource } from "../app-data-source";
import { InventoryVariantStorages } from "../entity/inventory_variant_storages.entity";
import { CurrenciesExchangesHistory } from "../entity/currencies_exchanges_history.entity";
import { OrderStatusEnum } from "../entity/orders.entity";

const dateKey = (date: Date, groupBy: 'day' | 'week' | 'month') => {
    const d = new Date(date);
    if (groupBy === 'month') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (groupBy === 'week') {
        // Lunes de la semana como clave
        const monday = new Date(d);
        const day = (d.getDay() + 6) % 7;
        monday.setDate(d.getDate() - day);
        return monday.toISOString().substring(0, 10);
    }
    return d.toISOString().substring(0, 10);
};

export class DashboardService {
    /**
     * Resumen del período: ventas facturadas, pedidos por estado,
     * ticket promedio y clientes activos.
     * Las agregaciones se hacen en memoria para mantener compatibilidad
     * entre MySQL y SQLite (tests); el volumen por empresa/período es acotado.
     */
    static async getSummary(company_id: number, from?: string, to?: string) {
        const qb = OrdersRepository
            .createQueryBuilder("o")
            .where("o.company_id = :company_id", { company_id });
        if (from) qb.andWhere("o.order_date >= :from", { from });
        if (to) qb.andWhere("o.order_date <= :to", { to });

        const orders = await qb.getMany();

        const byStatus: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let salesLocal = 0;
        let salesStable = 0;
        let invoicedCount = 0;

        for (const order of orders) {
            byStatus[order.order_status] = (byStatus[order.order_status] ?? 0) + 1;
            if (order.order_status === OrderStatusEnum.INVOICED) {
                salesLocal += Number(order.total_local);
                salesStable += Number(order.total_stable);
                invoicedCount++;
            }
        }

        const activeCustomers = await CustomerRepository
            .createQueryBuilder("c")
            .where("c.company_id = :company_id", { company_id })
            .andWhere("c.cust_status = 1")
            .getCount();

        return {
            sales: {
                total_local: Math.round(salesLocal * 100) / 100,
                total_stable: Math.round(salesStable * 100) / 100,
                invoiced_orders: invoicedCount,
                average_ticket_stable: invoicedCount > 0 ? Math.round((salesStable / invoicedCount) * 100) / 100 : 0,
            },
            orders_by_status: {
                draft: byStatus[1],
                confirmed: byStatus[2],
                dispatched: byStatus[3],
                invoiced: byStatus[4],
                cancelled: byStatus[5],
            },
            total_orders: orders.length,
            active_customers: activeCustomers,
        };
    }

    /**
     * Serie temporal de ventas facturadas agrupada por día/semana/mes
     */
    static async getSalesSeries(company_id: number, from?: string, to?: string, groupBy: 'day' | 'week' | 'month' = 'day') {
        const qb = OrdersRepository
            .createQueryBuilder("o")
            .where("o.company_id = :company_id", { company_id })
            .andWhere("o.order_status = :status", { status: OrderStatusEnum.INVOICED });
        if (from) qb.andWhere("o.order_date >= :from", { from });
        if (to) qb.andWhere("o.order_date <= :to", { to });

        const orders = await qb.orderBy("o.order_date", "ASC").getMany();

        const series = new Map<string, { period: string; total_local: number; total_stable: number; orders: number }>();
        for (const order of orders) {
            const key = dateKey(order.order_date, groupBy);
            const entry = series.get(key) ?? { period: key, total_local: 0, total_stable: 0, orders: 0 };
            entry.total_local += Number(order.total_local);
            entry.total_stable += Number(order.total_stable);
            entry.orders++;
            series.set(key, entry);
        }

        return Array.from(series.values());
    }

    /**
     * Top productos vendidos (pedidos no cancelados) en el período
     */
    static async getTopProducts(company_id: number, from?: string, to?: string, limit: number = 10) {
        const qb = OrderItemsRepository
            .createQueryBuilder("item")
            .innerJoinAndSelect("item.order", "o")
            .innerJoinAndSelect("item.variant", "variant")
            .leftJoinAndSelect("variant.inventory", "inventory")
            .where("o.company_id = :company_id", { company_id })
            .andWhere("o.order_status != :cancelled", { cancelled: OrderStatusEnum.CANCELLED });
        if (from) qb.andWhere("o.order_date >= :from", { from });
        if (to) qb.andWhere("o.order_date <= :to", { to });

        const items = await qb.getMany();

        const byVariant = new Map<number, {
            inv_var_id: number;
            sku: string;
            product: string;
            quantity: number;
            total_stable: number;
            total_local: number;
        }>();

        for (const item of items) {
            const entry = byVariant.get(item.inv_var_id) ?? {
                inv_var_id: item.inv_var_id,
                sku: item.variant?.inv_var_sku ?? '',
                product: item.variant?.inventory
                    ? `${item.variant.inventory.inv_code} - ${item.variant.inventory.inv_description}`
                    : '',
                quantity: 0,
                total_stable: 0,
                total_local: 0,
            };
            entry.quantity += Number(item.quantity);
            entry.total_stable += Number(item.total_stable);
            entry.total_local += Number(item.total_local);
            byVariant.set(item.inv_var_id, entry);
        }

        return Array.from(byVariant.values())
            .sort((a, b) => b.total_stable - a.total_stable)
            .slice(0, limit);
    }

    /**
     * Variantes con stock por debajo del umbral (o de su mínimo configurado)
     */
    static async getLowStock(company_id: number, threshold?: number) {
        const rows = await appDataSource
            .getRepository(InventoryVariantStorages)
            .createQueryBuilder("vs")
            .innerJoinAndSelect("vs.inventoryVariant", "variant")
            .leftJoinAndSelect("variant.inventory", "inventory")
            .innerJoinAndSelect("vs.inventoryStorage", "storage")
            .where("storage.company_id = :company_id", { company_id })
            .andWhere("inventory.inv_is_stockable = 1")
            .getMany();

        return rows
            .filter(row => {
                const stock = Number(row.inv_vs_stock);
                const min = threshold !== undefined ? threshold : Number(row.inv_vs_stock_min);
                return stock <= min;
            })
            .map(row => ({
                inv_var_id: row.inv_var_id,
                sku: row.inventoryVariant?.inv_var_sku ?? '',
                product: row.inventoryVariant?.inventory
                    ? `${row.inventoryVariant.inventory.inv_code} - ${row.inventoryVariant.inventory.inv_description}`
                    : '',
                storage: row.inventoryStorage?.inv_storage_name ?? '',
                id_inv_storage: row.id_inv_storage,
                stock: Number(row.inv_vs_stock),
                stock_min: Number(row.inv_vs_stock_min),
            }))
            .sort((a, b) => a.stock - b.stock);
    }

    /**
     * Serie de tasa de cambio (tipo estable por defecto) de los últimos N días
     */
    static async getExchangeRateSeries(company_id: number, days: number = 30, type: number = 2) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const rows = await appDataSource
            .getRepository(CurrenciesExchangesHistory)
            .createQueryBuilder("h")
            .leftJoinAndSelect("h.currency", "currency")
            .where("h.company_id = :company_id", { company_id })
            .andWhere("h.currency_exc_type = :type", { type })
            .andWhere("h.created_at >= :since", { since })
            .orderBy("h.created_at", "ASC")
            .getMany();

        return rows.map(row => ({
            date: row.created_at,
            rate: Number(row.currency_exc_rate),
            currency: row.currency?.currency_iso_code ?? '',
        }));
    }

    /**
     * Actividad reciente de auditoría (trazabilidad en el dashboard)
     */
    static async getRecentActivity(company_id: number, limit: number = 10) {
        const rows = await AuditLogsRepository
            .createQueryBuilder("audit")
            .leftJoinAndSelect("audit.changed_by", "changed_by")
            .where("audit.company_id = :company_id", { company_id })
            .orderBy("audit.created_at", "DESC")
            .addOrderBy("audit.audit_id", "DESC")
            .limit(limit)
            .getMany();

        return rows.map(row => ({
            audit_id: row.audit_id,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            action_type: row.action_type,
            changed_by: row.changed_by
                ? `${(row.changed_by as any).first_name ?? ''} ${(row.changed_by as any).last_name ?? ''}`.trim() || (row.changed_by as any).username
                : null,
            created_at: row.created_at,
        }));
    }
}
