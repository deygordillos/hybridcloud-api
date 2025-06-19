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
import { Rel_Taxes_Sucursales } from "./rel_taxes_sucursales.entity";

@Index('company_tax_code', ['company_id', 'tax_code'], { unique: true })
@Index('tax_name_desc', ['tax_name', 'tax_description'])
@Index('tax_status', ['tax_status'])
@Entity('Taxes')
export class Taxes {
    @PrimaryGeneratedColumn({ unsigned: true })
    tax_id: number;

    @Column({ type: "int", unsigned: true })
    company_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @Column({ type: "varchar", length: 20, comment: "tax code of the products" })
    tax_code: string;

    @Column({ type: "varchar", length: 50, comment: "tax name of the products" })
    tax_name: string;

    @Column({ type: "varchar", length: 150, comment: "tax description of the products" })
    tax_description: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    tax_status: number;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 excent, 2 percent" })
    tax_type: number;

    @Column({ type: "float", precision: 5, scale: 2, default: 0.0, comment: "percentage" })
    tax_percentage: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @OneToMany(() => Rel_Taxes_Sucursales, (rel_tax_suc) => rel_tax_suc.taxes, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ referencedColumnName: 'tax_id' })
    taxes_sucursales: Rel_Taxes_Sucursales[];
}