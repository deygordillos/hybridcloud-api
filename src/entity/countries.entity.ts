import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Index('country_status_name', ['country_status', 'country_name'], {})
@Index('country_iso2', ['country_iso2'], {})
@Index('country_iso3', ['country_iso3'], {})
@Index('continent_name', ['continent_name'], {})
@Index('subcontinent_name', ['subcontinent_name'], {})

@Entity('Countries')
export class Countries {
    @PrimaryGeneratedColumn({ type: 'int', comment: "id incremental del pais" })
    country_id: number

    @Column({ length: 3, comment: "iso2 del pais" })
    country_iso2: string

    @Column({ length: 3, comment: "iso3 del pais" })
    country_iso3: string

    @Column({ length: 4, comment: "prefijo numerico celular", nullable: true })
    prefix_cellphone: string

    @Column({ length: 4, comment: "nombre del pais" })
    country_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    country_status: number

    @Column({ length: 5, comment: "id fiscal", nullable: true })
    min_id_fiscal: string

    @Column({ length: 60, comment: "nombre id fiscal", nullable: true })
    nombre_id_fiscal: string

    @Column({ length: 20, comment: "lenguaje oficial del pais", nullable: true })
    country_language: string

    @Column({ length: 20, comment: "continente", nullable: true })
    continent_name: string

    @Column({ length: 40, comment: "subcontinent_name", nullable: true })
    subcontinent_name: string

    @Column({ length: 3, comment: "iso moneda", nullable: true })
    country_iso_coin: string

    @Column({ length: 100, comment: "nombre iso moneda", nullable: true })
    country_iso_coin_name: string

    @Column({ length: 100, comment: "country moneda name", nullable: true })
    country_coin_name: string

    @Column({ length: 100, comment: "country symbol moneda name", nullable: true })
    country_coin_symbol_name: string

    @Column({ length: 100, comment: "country mask_phone", nullable: true })
    mask_phone: string
}