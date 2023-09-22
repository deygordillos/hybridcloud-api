import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm"

@Index('company_status_name', ['company_status', 'company_name'], {})
@Index('group_id', ['group_id'], {})
@Index('country_id', ['country_id'], {})
@Index('company_slug', ['company_slug'], {})

@Entity('Companies')
export class Companies {
    @PrimaryGeneratedColumn({ type: 'int', comment: "id incremental de la empresa" })
    company_id: number

    @Column({ length: 50, comment: "nombre de la empresa" })
    company_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    company_status: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ length: 7, comment: "hexadecimal de la empresa", nullable: true })
    company_color: string

    @Column({ length: 200, comment: "razon social de la empresa" })
    company_razon_social: string

    @Column({ length: 30, comment: "slug de busqueda de la empresa", unique: true })
    company_slug: string

    @Column({ length: 30, comment: "rif de la empresa", unique: true })
    company_id_fiscal: string

    @Column({ length: 100, comment: "correo de la empresa" })
    company_email: string

    @Column({ length: 20, comment: "telefono de la empresa" })
    company_phone: string

    @Column({ length: 20, comment: "telefono 2 de la empresa", nullable: true })
    company_phone2: string

    @Column({ length: 200, comment: "url de la empresa", nullable: true })
    company_website: string

    @Column({ length: 200, comment: "url facebook de la empresa", nullable: true })
    company_facebook: string

    @Column({ length: 200, comment: "url instagram de la empresa", nullable: true })
    company_instagram: string

    @Column({ length: 100, comment: "base de datos de la empresa" })
    company_database: string

    @Column({ length: 200, comment: "url logo de la empresa", nullable: true })
    company_url_logo: string

    @Column({ length: 50, comment: "contacto de la empresa", nullable: true })
    company_contact_name: string

    @Column({ length: 20, comment: "telefono contacto de la empresa", nullable: true })
    company_contact_phone: string

    @Column({ length: 200, comment: "correo contacto de la empresa", nullable: true })
    company_contact_email: string

    @Column({ type: 'int', comment: "id del pais donde esta la empresa" })
    country_id: number

    @Column({ type: 'int', comment: "id del grupo empresarial" })
    group_id: number
}