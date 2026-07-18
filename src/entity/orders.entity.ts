import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { Companies } from "./companies.entity";
import { Customers } from "./customers.entity";
import { Users } from "./users.entity";
import { InventoryStorage } from "./inventoryStorage.entity";
import { OrderItems } from "./order_items.entity";

export enum OrderStatusEnum {
    DRAFT = 1,
    CONFIRMED = 2,
    DISPATCHED = 3,
    INVOICED = 4,
    CANCELLED = 5
}

@Index('company_order_code', ['company_id', 'order_code'], { unique: true })
@Index('idx_orders_status', ['order_status'])
@Index('idx_orders_cust', ['cust_id'])
@Index('idx_orders_date', ['company_id', 'order_date'])
@Entity('orders')
export class Orders {
    @PrimaryGeneratedColumn({ unsigned: true })
    order_id: number;

    @Column({ type: "int", unsigned: true })
    company_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @Column({ type: "varchar", length: 20, comment: "Correlativo del pedido por empresa, ej: PED-000001" })
    order_code: string;

    @Column({ type: "int", unsigned: true })
    cust_id: number;

    @ManyToOne(() => Customers, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'cust_id' })
    customer: Customers;

    @Column({ type: "int", unsigned: true, comment: "Vendedor / usuario que registró el pedido" })
    user_id: number;

    @ManyToOne(() => Users, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @Column({ type: "int", unsigned: true, nullable: true, comment: "Depósito de despacho" })
    id_inv_storage: number | null;

    @ManyToOne(() => InventoryStorage, { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
    @JoinColumn({ name: 'id_inv_storage' })
    storage: InventoryStorage | null;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 borrador, 2 confirmado, 3 despachado, 4 facturado, 5 cancelado" })
    order_status: number;

    @Column({ type: "datetime", comment: "Fecha del pedido" })
    order_date: Date;

    // --- Snapshot multimoneda (patrón local/stable/ref de inventory_prices) ---
    @Column({ type: "int", unsigned: true, nullable: true })
    currency_id_local: number | null;

    @Column({ type: "int", unsigned: true, nullable: true })
    currency_id_stable: number | null;

    @Column({ type: "int", unsigned: true, nullable: true })
    currency_id_ref: number | null;

    @Column({ type: "decimal", precision: 18, scale: 8, nullable: true, comment: "Tasa local<->stable sellada al confirmar" })
    exchange_rate_stable: number | null;

    @Column({ type: "decimal", precision: 18, scale: 8, nullable: true, comment: "Tasa local<->ref sellada al confirmar" })
    exchange_rate_ref: number | null;

    @Column({ type: "tinyint", width: 1, default: 2, comment: "Método de conversión snapshot: 1 DIVIDE, 2 MULTIPLY" })
    exchange_method: number;

    // --- Totales snapshot (persistidos, nunca recalcular pedidos confirmados) ---
    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    subtotal_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    subtotal_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    subtotal_ref: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_total_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_total_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_total_ref: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    tax_total_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    tax_total_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    tax_total_ref: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_ref: number;

    @Column({ type: "varchar", length: 500, nullable: true })
    order_notes: string | null;

    // --- Sellos de transición de estado ---
    @Column({ type: "datetime", nullable: true })
    confirmed_at: Date | null;

    @Column({ type: "datetime", nullable: true })
    dispatched_at: Date | null;

    @Column({ type: "datetime", nullable: true })
    invoiced_at: Date | null;

    @Column({ type: "datetime", nullable: true })
    cancelled_at: Date | null;

    @Column({ type: "int", unsigned: true, nullable: true })
    created_by: number | null;

    @Column({ type: "int", unsigned: true, nullable: true })
    updated_by: number | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @OneToMany(() => OrderItems, item => item.order, { cascade: true })
    items: OrderItems[];
}
