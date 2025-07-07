import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne, JoinTable } from "typeorm"
import { Rel_Coins_Companies } from "./rel_coins_companies.entity";

@Index('idx_id_coin_company', ['id_coin_company'], {})
@Index('idx_id_sucursal', ['sucursal_id'], {})

@Entity('Rel_Coins_Companies_Sucursal')
export class Rel_Coins_Companies_Sucursal {
    @PrimaryGeneratedColumn({ comment: "id relacional de la moneda de la empresa para sucursal" })
    id_coin_company_sucursal: number

    @Column({ type: "int", comment: "id rel coin - empresa" })
    id_coin_company: number;

    @Column({ type: "int", comment: "id sucursal de la empresa" })
    sucursal_id: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @ManyToOne(() => Rel_Coins_Companies, (relcoinscompanies) => relcoinscompanies.coins_companies, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'id_coin_company' })
    coins_companies: Rel_Coins_Companies;

    // @ManyToOne(() => Sucursales, (sucursal) => sucursal.coins_companies_sucursales, {
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    // })
    // @JoinColumn({ name: 'sucursal_id' })
    // sucursales: Sucursales;
}