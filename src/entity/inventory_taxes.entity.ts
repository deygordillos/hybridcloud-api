import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index
} from "typeorm";
import { Inventory } from "./inventory.entity";
import { Taxes } from "./taxes.entity";

@Index('idx_inv_id', ['inv_id'])
@Index('idx_tax_id', ['tax_id'])
@Entity('inventory_taxes')
export class InventoryTaxes {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_tax_id: number;

    @Column({ type: "int", unsigned: true })
    inv_id: number;

    @Column({ type: "int", unsigned: true })
    tax_id: number;

    @ManyToOne(() => Inventory, inventory => inventory.inventoryTaxes, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_id' })
    inventory: Inventory;

    @ManyToOne(() => Taxes, tax => tax.inventoryTaxes, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'tax_id' })
    tax: Taxes;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
}