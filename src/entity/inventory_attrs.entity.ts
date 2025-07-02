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
import { Companies } from "./companies.entity";

@Index('company_attr_name', ['company_id', 'attr_name'], { unique: true })
@Index('attr_status', ['attr_status'])
@Entity('inventory_attrs')
export class InventoryAttrs {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_attr_id: number;

    @Column({ type: "int", unsigned: true })
    company_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @Column({ type: "varchar", length: 50, comment: "name of the inventory attribute" })
    attr_name: string;

    @Column({ type: "varchar", length: 150, nullable: true, comment: "description of the inventory attribute" })
    attr_description: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    attr_status: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}