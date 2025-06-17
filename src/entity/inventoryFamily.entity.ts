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

@Entity("InventoryFamily")
export class InventoryFamily {
    @PrimaryGeneratedColumn({ unsigned: true })
    id_inv_family: number;

    @ManyToOne(() => Companies, (company) => company.customers, { 
        onDelete: "CASCADE", 
        onUpdate: "CASCADE" 
    })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @Column({ type: "varchar", length: 20, comment: "código de la familia de productos" })
    inv_family_code: string;

    @Column({ type: "varchar", length: 80, comment: "nombre de la familia de productos" })
    inv_family_name: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    inv_family_status: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}
