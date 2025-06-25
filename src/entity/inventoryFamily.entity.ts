import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    JoinColumn
} from "typeorm";
import { Companies } from "./companies.entity";

@Index("company_inventoryFamily", ["company_id", "inv_family_code"], { unique: true })
@Index("inv_family_name", ["inv_family_name"])
@Index("inv_family_status", ["inv_family_status"])
@Entity("inventory_family")
export class InventoryFamily {
    @PrimaryGeneratedColumn({ unsigned: true })
    id_inv_family: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @Column({ type: "varchar", length: 20, comment: "product family code" })
    inv_family_code: string;

    @Column({ type: "varchar", length: 80, comment: "product family name" })
    inv_family_name: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    inv_family_status: number;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "If products are stockable. 1 yes, 0 no" })
    inv_is_stockable: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "If products are lot managed. 1 yes, 0 no" })
    inv_is_lot_managed: number;

    @Column({ type: "int", unsigned: true, nullable: true, comment: "Default tax id" })
    tax_id: number | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}