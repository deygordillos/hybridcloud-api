import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { Orders } from "./orders.entity";
import { InventoryVariants } from "./inventory_variants.entity";
import { InventoryPrices } from "./inventory_prices.entity";

@Index('idx_order_items_order', ['order_id'])
@Index('idx_order_items_variant', ['inv_var_id'])
@Entity('order_items')
export class OrderItems {
    @PrimaryGeneratedColumn({ unsigned: true })
    order_item_id: number;

    @Column({ type: "int", unsigned: true })
    order_id: number;

    @ManyToOne(() => Orders, order => order.items, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'order_id' })
    order: Orders;

    @Column({ type: "int", unsigned: true })
    inv_var_id: number;

    @ManyToOne(() => InventoryVariants, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_var_id' })
    variant: InventoryVariants;

    @Column({ type: "int", unsigned: true, nullable: true, comment: "Precio origen para trazabilidad" })
    inv_price_id: number | null;

    @ManyToOne(() => InventoryPrices, { onDelete: "SET NULL", onUpdate: "CASCADE", nullable: true })
    @JoinColumn({ name: 'inv_price_id' })
    inventoryPrice: InventoryPrices | null;

    @Column({ type: "decimal", precision: 18, scale: 3 })
    quantity: number;

    // --- Snapshot de precio unitario en 3 monedas ---
    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    price_unit_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    price_unit_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    price_unit_ref: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    discount_percent: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_amount_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_amount_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    discount_amount_ref: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0, comment: "Impuestos del item desde inventory_taxes" })
    tax_amount_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    tax_amount_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    tax_amount_ref: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_local: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_stable: number;

    @Column({ type: "decimal", precision: 18, scale: 3, default: 0 })
    total_ref: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    item_notes: string | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}
