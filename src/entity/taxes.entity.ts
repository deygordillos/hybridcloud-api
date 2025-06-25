import {
    Entity,
    Column,
    Index,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";
import { Companies } from "./companies.entity";
import { InventoryTaxes } from "./inventory_taxes";

@Index('company_tax_code', ['company_id', 'tax_code'], { unique: true })
@Index('tax_name_desc', ['tax_name', 'tax_description'])
@Index('tax_status', ['tax_status'])
@Entity('taxes')
export class Taxes {
    @PrimaryGeneratedColumn({ unsigned: true })
    tax_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @Column({ type: "varchar", length: 20, comment: "tax code of the products" })
    tax_code: string;

    @Column({ type: "varchar", length: 50, comment: "tax name of the products" })
    tax_name: string;

    @Column({ type: "varchar", length: 150, nullable: true, comment: "tax description of the products" })
    tax_description: string | null;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    tax_status: number;

    @Column({ type: "tinyint", width: 1, default: 2, comment: "1 excent, 2 percent, 3 fixed" })
    tax_type: number;

    @Column({ type: "float", precision: 5, scale: 2, default: 0.0, comment: "tax value" })
    tax_value: number;

    @Column({ type: "int", unsigned: true, nullable: true, comment: "Currency tax id" })
    currency_id: number | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @OneToMany(() => InventoryTaxes, inventoryTaxes => inventoryTaxes.tax)
    inventoryTaxes: InventoryTaxes[];
}