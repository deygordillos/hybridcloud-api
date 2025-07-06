import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { InventoryVariants } from "./inventory_variants.entity";
import { InventoryAttrsValues } from "./inventory_attrs_values.entity";

@Entity('inventory_variants_attrs')
export class InventoryVariantsAttrs {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_varattr_id: number;

    @Column({ type: "int", unsigned: true })
    inv_var_id: number;

    @ManyToOne(() => InventoryVariants, variant => variant.variantAttrs, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_var_id' })
    inventoryVariant: InventoryVariants;

    @Column({ type: "int", unsigned: true })
    inv_attrval_id: number;

    @ManyToOne(() => InventoryAttrsValues, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_attrval_id' })
    attrValue: InventoryAttrsValues;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}