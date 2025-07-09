import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany
} from "typeorm";
import { Inventory } from "./inventory.entity";
import { InventoryVariantsAttrs } from "./inventory_variants_attrs.entity";
import { InventoryLots } from "./inventory_lots.entity";

@Index('inv_id_inv_var_sku', ['inv_id', 'inv_var_sku'])
@Index('inv_var_sku_inv_var_status', ['inv_var_sku', 'inv_var_status'])
@Index('inv_var_status', ['inv_var_status'])
@Entity('inventory_variants')
export class InventoryVariants {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_var_id: number;

    @Column({ type: "int", unsigned: true })
    inv_id: number;

    @ManyToOne(() => Inventory, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_id' })
    inventory: Inventory;

    @Column({ type: "varchar", length: 100, comment: "SKU of the inventory variant" })
    inv_var_sku: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    inv_var_status: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @OneToMany(() => InventoryVariantsAttrs, iva => iva.inventoryVariant)
    variantAttrs: InventoryVariantsAttrs[];

    @OneToMany(() => InventoryLots, lot => lot.inventoryVariant)
    inventoryLots: InventoryLots[];
}