import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm"
import { Companies } from "./companies.entity";

@Index('sucursal_status_name', ['sucursal_status', 'sucursal_name'], {})
@Index('company_id', ['company_id'], {})
@Index('sucursal_slug', ['sucursal_slug'], {})

@Entity('Sucursales')
export class Sucursales {
    @PrimaryGeneratedColumn({ type: 'int', comment: "id incremental de la sucursal" })
    sucursal_id: number

    @Column({ length: 50, comment: "nombre de la sucursal" })
    sucursal_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    sucursal_status: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ length: 7, comment: "hexadecimal de la sucursal", nullable: true })
    sucursal_color: string

    @Column({ length: 200, comment: "razon social de la sucursal" })
    sucursal_razon_social: string

    @Column({ length: 30, comment: "slug de busqueda de la sucursal", unique: true })
    sucursal_slug: string

    @Column({ length: 30, comment: "rif de la sucursal", unique: true })
    sucursal_id_fiscal: string

    @Column({ length: 100, comment: "correo de la sucursal" })
    sucursal_email: string

    @Column({ length: 20, comment: "telefono de la sucursal" })
    sucursal_phone: string

    @Column({ length: 20, comment: "telefono 2 de la sucursal", nullable: true })
    sucursal_phone2: string

    @Column({ length: 200, comment: "url de la sucursal", nullable: true })
    sucursal_website: string

    @Column({ length: 200, comment: "url facebook de la sucursal", nullable: true })
    sucursal_facebook: string

    @Column({ length: 200, comment: "url instagram de la sucursal", nullable: true })
    sucursal_instagram: string

    @Column({ length: 200, comment: "url logo de la sucursal", nullable: true })
    sucursal_url_logo: string

    @Column({ length: 50, comment: "contacto de la sucursal", nullable: true })
    sucursal_contact_name: string

    @Column({ length: 20, comment: "telefono contacto de la sucursal", nullable: true })
    sucursal_contact_phone: string

    @Column({ length: 200, comment: "correo contacto de la sucursal", nullable: true })
    sucursal_contact_email: string

    @Column({ type: 'int', comment: "id de la empresa" })
    @JoinColumn()
    @ManyToOne(() => Companies, (companies) => companies.company_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    company_id: number
}