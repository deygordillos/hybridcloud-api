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

@Index("company_inv_storage_code", ["company_id", "inv_storage_code"], { unique: true })
@Index("inv_storage_name", ["inv_storage_name"])
@Index("inv_storage_status", ["inv_storage_status"])
@Entity("inventory_storages")
export class InventoryStorage {
    @PrimaryGeneratedColumn({ unsigned: true })
    id_inv_storage: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @Column({ type: "varchar", length: 20, comment: "storage code for the product" })
    inv_storage_code: string;

    @Column({ type: "varchar", length: 80, comment: "storage name for the product" })
    inv_storage_name: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    inv_storage_status: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}