import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { InventoryVariants } from "./inventory_variants.entity";

@Entity("inventory_lots")
@Index("lot_number", ["lot_number"])
@Index("lot_status", ["lot_status"])
@Index("expiration_manufacture_date", ["expiration_date", "manufacture_date"])
export class InventoryLots {
    @PrimaryGeneratedColumn({ type: "int", unsigned: true, name: "inv_lot_id" })
    inv_lot_id: number;

    @Column({ type: "int", unsigned: true, name: "inv_var_id" })
    inv_var_id: number;

    @Column({ type: "varchar", length: 100, name: "lot_number", comment: "Lot number of the inventory variant" })
    lot_number: string;

    @Column({ type: "varchar", length: 100, name: "lot_origin", comment: "Origin of the lot", nullable: true })
    lot_origin: string;

    @Column({ type: "tinyint", width: 1, default: 1, name: "lot_status", comment: "1 active, 0 inactive" })
    lot_status: number;

    @Column({ type: "date", name: "expiration_date", comment: "Expiration date of the lot", nullable: true })
    expiration_date: Date;

    @Column({ type: "date", name: "manufacture_date", comment: "Manufacture date of the lot", nullable: true })
    manufacture_date: Date;

    @Column({ type: "text", name: "lot_notes", comment: "Notes of the lot", nullable: true })
    lot_notes: string;

    @Column({ type: "decimal", precision: 10, scale: 3, name: "lot_unit_cost", comment: "Unit cost of the lot", nullable: true })
    lot_unit_cost: number;

    @Column({ type: "int", default: 1, name: "lot_unit_currency_id", comment: "Currency of the lot" })
    lot_unit_currency_id: number;

    @Column({ type: "decimal", precision: 10, scale: 3, name: "lot_unit_cost_ref", comment: "Reference cost of the lot", nullable: true })
    lot_unit_cost_ref: number;

    @Column({ type: "int", default: 1, name: "lot_unit_currency_id_ref", comment: "Reference currency of the lot" })
    lot_unit_currency_id_ref: number;

    @CreateDateColumn({ type: "datetime", name: "created_at" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", name: "updated_at" })
    updated_at: Date;

    // Relations
    @ManyToOne(() => InventoryVariants, inventoryVariants => inventoryVariants.inventoryLots)
    @JoinColumn({ name: "inv_var_id" })
    inventoryVariant: InventoryVariants;
} 