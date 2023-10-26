import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from "typeorm"
import { Rel_Taxes_Sucursales } from "./rel_taxes_sucursales.entity"

@Index('tax_company_status_code', ['company_id', 'tax_status', 'tax_code'], {})
@Index('company_id_code', ['company_id', 'tax_code'], {})
@Index('company_id', ['company_id'], {})
@Index('tax_type', ['tax_type'], {})

@Entity('Taxes')
export class Taxes {
    @PrimaryGeneratedColumn()
    tax_id: number

    @Column({ length: 10, comment: "codigo del impuesto" })
    tax_code: string

    @Column({ length: 80, comment: "descripcion del impuesto", nullable: true })
    tax_description: string

    @Column({ width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    tax_status: number

    @Column({ length: 30, comment: "siglas del impuesto", nullable: true })
    tax_siglas: string

    @Column({ width: 1, default: 2, comment: "1 exento, 2 afecto" })
    tax_type: number

    @Column({ width: 3, comment: "porcentaje de impuesto", default: 0 })
    tax_percentage: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ width: 1, default: 0, comment: "Afecta costo. 1 si, 0 no" })
    tax_affects_cost: number

    @Column({ type: 'int', comment: "id de la empresa" })
    company_id: number

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