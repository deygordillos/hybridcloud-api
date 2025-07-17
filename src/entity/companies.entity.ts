import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne} from "typeorm"
// import { Rel_Coins_Companies } from "./rel_coins_companies.entity";
import { Groups } from "./groups.entity";
import { Countries } from "./countries.entity";
import { Customers } from "./customers.entity";
import { CurrenciesExchanges } from "./currencies_exchanges.entity";
import { CurrenciesExchangesHistory } from "./currencies_exchanges_history.entity";

@Index('company_status_name', ['company_status', 'company_name'], {})
@Index('company_slug', ['company_slug'], {})
@Index('company_razon_social', ['company_razon_social'], {})

@Entity('companies')
export class Companies {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: "id incremental de la empresa" })
    company_id: number

    @ManyToOne(() => Groups, (groups) => groups.companies, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'group_id' })
    group_id: Groups
    
    @Column({ type: 'tinyint', width: 1, default: 0, comment: "1 es principal, 0 no es empresa principal del grupo" })
    company_is_principal: number

    @Column({ length: 50, unique: true, comment: "nombre de la empresa" })
    company_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    company_status: number

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ length: 7, comment: "hexadecimal de la empresa", nullable: true })
    company_color: string

    @Column({ length: 200, comment: "razon social de la empresa", nullable: true })
    company_razon_social: string

    @Column({ length: 100, comment: "slug de busqueda de la empresa", nullable: true })
    company_slug: string

    @Column({ length: 30, comment: "rif de la empresa", unique: true })
    company_id_fiscal: string

    @Column({ length: 100, comment: "correo de la empresa", nullable: true })
    company_email: string

    @Column({ length: 100, comment: "dirección de la empresa", nullable: true })
    company_address: string

    @Column({ length: 20, comment: "telefono de la empresa", nullable: true })
    company_phone1: string

    @Column({ length: 20, comment: "telefono 2 de la empresa", nullable: true })
    company_phone2: string

    @Column({ length: 200, comment: "url de la empresa", nullable: true })
    company_website: string

    @Column({ length: 200, comment: "url facebook de la empresa", nullable: true })
    company_facebook: string

    @Column({ length: 200, comment: "url instagram de la empresa", nullable: true })
    company_instagram: string

    @Column({ length: 100, comment: "base de datos de la empresa", nullable: true, default: null })
    company_database: string

    @Column({ length: 200, comment: "url logo de la empresa", nullable: true })
    company_url_logo: string

    @Column({ length: 50, comment: "contacto de la empresa", nullable: true })
    company_contact_name: string

    @Column({ length: 20, comment: "telefono contacto de la empresa", nullable: true })
    company_contact_phone: string

    @Column({ length: 200, comment: "correo contacto de la empresa", nullable: true })
    company_contact_email: string

    @Column({ comment: "fecha de inicio de la licencia", nullable: true })
    company_start: Date | null

    @Column({ comment: "fecha de fin de la licencia", nullable: true })
    company_end: Date | null

    @ManyToOne(() => Countries, (country) => country.companies, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'country_id' })
    country_id: Countries


    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @OneToMany(() => Customers, (cust) => cust.company_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    customers: Customers[];

    @OneToMany(() => CurrenciesExchanges, (currencyExchange) => currencyExchange.company, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    currency_exchanges: CurrenciesExchanges[];

    @OneToMany(() => CurrenciesExchangesHistory, (currencyExchangeHist) => currencyExchangeHist.company, {
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    currency_exchanges_history: CurrenciesExchangesHistory[];
}