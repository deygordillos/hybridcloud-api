import { appDataSource } from "../app-data-source";
import { Orders, OrderStatusEnum } from "../entity/orders.entity";
import { OrderItems } from "../entity/order_items.entity";
import { InventoryVariants } from "../entity/inventory_variants.entity";
import { InventoryVariantStorages } from "../entity/inventory_variant_storages.entity";
import { InventoryMovements } from "../entity/inventory_movements.entity";
import { InventoryPrices } from "../entity/inventory_prices.entity";
import { OrdersRepository } from "../repositories/OrdersRepository";
import { CurrenciesExchangesService } from "./CurrenciesExchangesService";
import { AuditService } from "./AuditService";
import { EntityManager } from "typeorm";

export interface OrderItemInput {
    inv_var_id: number;
    inv_price_id?: number | null;
    quantity: number;
    discount_percent?: number;
    price_unit_local?: number;
    price_unit_stable?: number;
    price_unit_ref?: number;
    item_notes?: string | null;
}

export interface OrderInput {
    cust_id: number;
    id_inv_storage?: number | null;
    order_date?: string | Date;
    order_notes?: string | null;
    items: OrderItemInput[];
}

export interface OrderFilters {
    order_status?: number;
    cust_id?: number;
    from?: string;
    to?: string;
}

const round3 = (value: number) => Math.round((Number(value) || 0) * 1000) / 1000;

export class OrdersService {

    /**
     * Transiciones válidas de la máquina de estados
     */
    static readonly VALID_TRANSITIONS: Record<number, number[]> = {
        [OrderStatusEnum.DRAFT]: [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED],
        [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.DISPATCHED, OrderStatusEnum.CANCELLED],
        [OrderStatusEnum.DISPATCHED]: [OrderStatusEnum.INVOICED],
        [OrderStatusEnum.INVOICED]: [],
        [OrderStatusEnum.CANCELLED]: [],
    };

    /**
     * Listado paginado de pedidos por empresa con filtros
     */
    static async getOrdersByCompanyId(
        company_id: number,
        offset: number = 0,
        limit: number = 10,
        filters: OrderFilters = {}
    ) {
        const qb = OrdersRepository
            .createQueryBuilder("o")
            .leftJoinAndSelect("o.customer", "customer")
            .leftJoinAndSelect("o.storage", "storage")
            .where("o.company_id = :company_id", { company_id });

        if (filters.order_status) qb.andWhere("o.order_status = :order_status", { order_status: filters.order_status });
        if (filters.cust_id) qb.andWhere("o.cust_id = :cust_id", { cust_id: filters.cust_id });
        if (filters.from) qb.andWhere("o.order_date >= :from", { from: filters.from });
        if (filters.to) qb.andWhere("o.order_date <= :to", { to: filters.to });

        const [data, total] = await qb
            .orderBy("o.order_id", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Pedido por id con items
     */
    static async findOrderById(order_id: number) {
        return await OrdersRepository.findOne({
            where: { order_id },
            relations: {
                customer: true,
                storage: true,
                items: {
                    variant: {
                        inventory: true
                    }
                }
            }
        });
    }

    /**
     * Correlativo por empresa: PED-000001
     */
    static async generateOrderCode(company_id: number, manager: EntityManager): Promise<string> {
        const last = await manager
            .createQueryBuilder(Orders, "o")
            .where("o.company_id = :company_id", { company_id })
            .orderBy("o.order_id", "DESC")
            .getOne();

        let next = 1;
        if (last?.order_code) {
            const match = last.order_code.match(/(\d+)$/);
            if (match) next = parseInt(match[1], 10) + 1;
        }
        return `PED-${String(next).padStart(6, '0')}`;
    }

    /**
     * Snapshot de tasas de cambio vigentes de la empresa
     */
    static async getExchangeSnapshot(company_id: number) {
        const exchanges = await CurrenciesExchangesService.getCompanyCurrencies(company_id);
        const local = exchanges.find(e => e.currency_exc_type === 1);
        const stable = exchanges.find(e => e.currency_exc_type === 2);
        const ref = exchanges.find(e => e.currency_exc_type === 3);

        return {
            currency_id_local: local?.currency_id ?? null,
            currency_id_stable: stable?.currency_id ?? null,
            currency_id_ref: ref?.currency_id ?? null,
            exchange_rate_stable: stable ? Number(stable.currency_exc_rate) : null,
            exchange_rate_ref: ref ? Number(ref.currency_exc_rate) : null,
            exchange_method: stable?.exchange_method ?? 2,
        };
    }

    /**
     * Porcentaje total de impuestos (tipo 2) del producto de una variante.
     * Productos exentos (inv_is_exempt=1) no llevan impuesto.
     */
    private static async getVariantTaxPercent(inv_var_id: number, manager: EntityManager): Promise<number> {
        const variant = await manager.findOne(InventoryVariants, {
            where: { inv_var_id },
            relations: { inventory: { inventoryTaxes: { tax: true } } }
        });
        if (!variant) throw new Error(`Inventory variant ${inv_var_id} does not exist`);
        if (variant.inventory?.inv_is_exempt === 1) return 0;

        const taxes = variant.inventory?.inventoryTaxes ?? [];
        return taxes
            .map(it => it.tax)
            .filter(tax => tax && tax.tax_status === 1 && tax.tax_type === 2)
            .reduce((total, tax) => total + Number(tax.tax_value), 0);
    }

    /**
     * Construye los items del pedido con snapshot de precios e impuestos,
     * y devuelve los totales agregados.
     */
    private static async buildItems(items: OrderItemInput[], manager: EntityManager) {
        const builtItems: Partial<OrderItems>[] = [];
        const totals = {
            subtotal_local: 0, subtotal_stable: 0, subtotal_ref: 0,
            discount_total_local: 0, discount_total_stable: 0, discount_total_ref: 0,
            tax_total_local: 0, tax_total_stable: 0, tax_total_ref: 0,
            total_local: 0, total_stable: 0, total_ref: 0,
        };

        if (!items || items.length === 0) throw new Error("Order must have at least one item");

        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!quantity || quantity <= 0) throw new Error("Item quantity must be greater than zero");

            let priceLocal = Number(item.price_unit_local) || 0;
            let priceStable = Number(item.price_unit_stable) || 0;
            let priceRef = Number(item.price_unit_ref) || 0;

            // Si viene inv_price_id y no enviaron precios, tomar snapshot del precio base registrado
            if (item.inv_price_id && !priceLocal && !priceStable && !priceRef) {
                const price = await manager.findOne(InventoryPrices, { where: { inv_price_id: item.inv_price_id } });
                if (!price) throw new Error(`Inventory price ${item.inv_price_id} does not exist`);
                priceLocal = Number(price.price_base_local) || 0;
                priceStable = Number(price.price_base_stable) || 0;
                priceRef = Number(price.price_base_ref) || 0;
            }

            if (!priceLocal && !priceStable && !priceRef) {
                throw new Error(`Item for variant ${item.inv_var_id} has no price`);
            }

            const discountPercent = Number(item.discount_percent) || 0;
            if (discountPercent < 0 || discountPercent > 100) throw new Error("discount_percent must be between 0 and 100");

            const taxPercent = await OrdersService.getVariantTaxPercent(item.inv_var_id, manager);

            const gross = {
                local: priceLocal * quantity,
                stable: priceStable * quantity,
                ref: priceRef * quantity,
            };
            const discount = {
                local: gross.local * discountPercent / 100,
                stable: gross.stable * discountPercent / 100,
                ref: gross.ref * discountPercent / 100,
            };
            const taxBase = {
                local: gross.local - discount.local,
                stable: gross.stable - discount.stable,
                ref: gross.ref - discount.ref,
            };
            const tax = {
                local: taxBase.local * taxPercent / 100,
                stable: taxBase.stable * taxPercent / 100,
                ref: taxBase.ref * taxPercent / 100,
            };
            const total = {
                local: taxBase.local + tax.local,
                stable: taxBase.stable + tax.stable,
                ref: taxBase.ref + tax.ref,
            };

            builtItems.push({
                inv_var_id: item.inv_var_id,
                inv_price_id: item.inv_price_id ?? null,
                quantity: round3(quantity),
                price_unit_local: round3(priceLocal),
                price_unit_stable: round3(priceStable),
                price_unit_ref: round3(priceRef),
                discount_percent: discountPercent,
                discount_amount_local: round3(discount.local),
                discount_amount_stable: round3(discount.stable),
                discount_amount_ref: round3(discount.ref),
                tax_amount_local: round3(tax.local),
                tax_amount_stable: round3(tax.stable),
                tax_amount_ref: round3(tax.ref),
                total_local: round3(total.local),
                total_stable: round3(total.stable),
                total_ref: round3(total.ref),
                item_notes: item.item_notes ?? null,
            });

            totals.subtotal_local += gross.local;
            totals.subtotal_stable += gross.stable;
            totals.subtotal_ref += gross.ref;
            totals.discount_total_local += discount.local;
            totals.discount_total_stable += discount.stable;
            totals.discount_total_ref += discount.ref;
            totals.tax_total_local += tax.local;
            totals.tax_total_stable += tax.stable;
            totals.tax_total_ref += tax.ref;
            totals.total_local += total.local;
            totals.total_stable += total.stable;
            totals.total_ref += total.ref;
        }

        for (const key of Object.keys(totals)) {
            totals[key] = round3(totals[key]);
        }

        return { builtItems, totals };
    }

    /**
     * Crea un pedido en estado borrador con sus items (transaccional)
     */
    static async create(company_id: number, user_id: number, data: OrderInput) {
        return await appDataSource.transaction(async manager => {
            const { builtItems, totals } = await OrdersService.buildItems(data.items, manager);
            const snapshot = await OrdersService.getExchangeSnapshot(company_id);
            const order_code = await OrdersService.generateOrderCode(company_id, manager);

            const order = manager.create(Orders, {
                company_id,
                order_code,
                cust_id: data.cust_id,
                user_id,
                id_inv_storage: data.id_inv_storage ?? null,
                order_status: OrderStatusEnum.DRAFT,
                order_date: data.order_date ? new Date(data.order_date) : new Date(),
                order_notes: data.order_notes ?? null,
                created_by: user_id,
                ...snapshot,
                ...totals,
            });
            await manager.save(order);

            const items = builtItems.map(item => manager.create(OrderItems, { ...item, order_id: order.order_id }));
            await manager.save(items);

            order.items = items as OrderItems[];
            return order;
        });
    }

    /**
     * Actualiza un pedido (solo borrador). Si vienen items, se reemplazan todos.
     */
    static async update(order: Orders, user_id: number, data: Partial<OrderInput>) {
        if (order.order_status !== OrderStatusEnum.DRAFT) {
            throw new Error("Only draft orders can be updated");
        }

        return await appDataSource.transaction(async manager => {
            if (data.cust_id !== undefined) order.cust_id = data.cust_id;
            if (data.id_inv_storage !== undefined) order.id_inv_storage = data.id_inv_storage;
            if (data.order_date !== undefined) order.order_date = new Date(data.order_date);
            if (data.order_notes !== undefined) order.order_notes = data.order_notes;
            order.updated_by = user_id;

            if (data.items) {
                const { builtItems, totals } = await OrdersService.buildItems(data.items, manager);
                await manager.delete(OrderItems, { order_id: order.order_id });
                const items = builtItems.map(item => manager.create(OrderItems, { ...item, order_id: order.order_id }));
                await manager.save(items);
                Object.assign(order, totals);
                order.items = items as OrderItems[];
            }

            await manager.save(Orders, order);
            return order;
        });
    }

    /**
     * Valida stock disponible por depósito para los items del pedido.
     * Solo aplica a productos almacenables (inv_is_stockable = 1).
     */
    private static async validateStock(order: Orders, manager: EntityManager) {
        if (!order.id_inv_storage) return;

        for (const item of order.items) {
            const variant = await manager.findOne(InventoryVariants, {
                where: { inv_var_id: item.inv_var_id },
                relations: { inventory: true }
            });
            if (!variant?.inventory || variant.inventory.inv_is_stockable !== 1) continue;

            const storageRow = await manager.findOne(InventoryVariantStorages, {
                where: { inv_var_id: item.inv_var_id, id_inv_storage: order.id_inv_storage }
            });
            const available = Number(storageRow?.inv_vs_stock ?? 0) - Number(storageRow?.inv_vs_stock_reserved ?? 0);
            if (available < Number(item.quantity)) {
                throw new Error(`Insufficient stock for SKU ${variant.inv_var_sku}: available ${available}, required ${item.quantity}`);
            }
        }
    }

    /**
     * Transición de estado del pedido (única vía). Cada transición:
     * - valida contra VALID_TRANSITIONS
     * - sella su timestamp
     * - registra auditoría STATUS_CHANGE
     * Confirmar re-sella la tasa de cambio vigente. Despachar genera movimientos
     * de salida y descuenta stock. Los totales NUNCA se recalculan después de
     * confirmado (snapshot anti-inflación).
     */
    static async changeStatus(order: Orders, newStatus: number, user_id: number, ip_address?: string) {
        const allowed = OrdersService.VALID_TRANSITIONS[order.order_status] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${order.order_status} to ${newStatus}`);
        }

        const previousStatus = order.order_status;

        const updated = await appDataSource.transaction(async manager => {
            switch (newStatus) {
                case OrderStatusEnum.CONFIRMED: {
                    // Re-snapshot de tasa vigente al confirmar
                    const snapshot = await OrdersService.getExchangeSnapshot(order.company_id);
                    Object.assign(order, snapshot);
                    await OrdersService.validateStock(order, manager);
                    order.confirmed_at = new Date();
                    break;
                }
                case OrderStatusEnum.DISPATCHED: {
                    if (!order.id_inv_storage) throw new Error("Order must have a storage assigned to be dispatched");
                    await OrdersService.validateStock(order, manager);

                    for (const item of order.items) {
                        const variant = await manager.findOne(InventoryVariants, {
                            where: { inv_var_id: item.inv_var_id },
                            relations: { inventory: true }
                        });
                        if (!variant?.inventory || variant.inventory.inv_is_stockable !== 1) continue;

                        const movement = manager.create(InventoryMovements, {
                            id_inv_storage: order.id_inv_storage,
                            inv_var_id: item.inv_var_id,
                            movement_type: 2, // Out
                            quantity: item.quantity,
                            movement_reason: `Despacho de pedido ${order.order_code}`,
                            related_doc: order.order_code,
                            user_id,
                        });
                        await manager.save(movement);

                        const storageRow = await manager.findOne(InventoryVariantStorages, {
                            where: { inv_var_id: item.inv_var_id, id_inv_storage: order.id_inv_storage }
                        });
                        if (storageRow) {
                            storageRow.inv_vs_stock_prev = storageRow.inv_vs_stock;
                            storageRow.inv_vs_stock = round3(Number(storageRow.inv_vs_stock) - Number(item.quantity));
                            storageRow.user_id = user_id;
                            await manager.save(storageRow);
                        }
                    }
                    order.dispatched_at = new Date();
                    break;
                }
                case OrderStatusEnum.INVOICED: {
                    order.invoiced_at = new Date();
                    break;
                }
                case OrderStatusEnum.CANCELLED: {
                    order.cancelled_at = new Date();
                    break;
                }
            }

            order.order_status = newStatus;
            order.updated_by = user_id;
            await manager.save(Orders, order);
            return order;
        });

        await AuditService.log({
            company_id: order.company_id,
            entity_type: 'orders',
            entity_id: order.order_id,
            action_type: 'STATUS_CHANGE',
            before: { order_status: previousStatus },
            after: { order_status: newStatus },
            changed_by: user_id,
            ip_address: ip_address ?? null,
        });

        return updated;
    }

    /**
     * Elimina un pedido (solo borrador)
     */
    static async delete(order: Orders) {
        if (order.order_status !== OrderStatusEnum.DRAFT) {
            throw new Error("Only draft orders can be deleted");
        }
        await OrdersRepository.remove(order);
        return { message: "Order deleted" };
    }
}
