import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index
} from "typeorm";
import { InventoryAttrs } from "./inventory_attrs.entity";

@Index('inv_attr_id_attr_value', ['inv_attr_id', 'attr_value'], { unique: true })
@Entity('inventory_attrs_values')
export class InventoryAttrsValues {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_attrval_id: number;

    @Column({ type: "int", unsigned: true, select: false })
    inv_attr_id: number;

    @ManyToOne(() => InventoryAttrs, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_attr_id' })
    inventoryAttr: InventoryAttrs;

    @Column({ type: "varchar", length: 150, comment: "value of the inventory attribute" })
    attr_value: string;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;
}