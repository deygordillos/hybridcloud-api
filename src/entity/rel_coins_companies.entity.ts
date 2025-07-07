import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne, ManyToMany, OneToMany } from "typeorm"
import { Coins } from "./coins.entity";
import { Companies } from "./companies.entity";
import { Rel_Coins_Companies_Sucursal } from "./rel_coins_companies_sucursal.entity";

@Index('idx_coin_id', ['coin_id'], {})
@Index('idx_company_id', ['company_id'], {})
@Index('idx_coin_id_company', ['coin_id', 'company_id'], {})

@Entity('Rel_Coins_Companies')
export class Rel_Coins_Companies {
    @PrimaryGeneratedColumn({ comment: "id relacional de la moneda y empresa" })
    id_coin_company: number

    @Column({ type: "int", comment: "id de la moneda" })
    coin_id: number;

    @Column({ type: "int", comment: "id de la empresa" })
    company_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 6,default: 1, comment: "factor de conversión" })
    coin_factor: number
    
    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @ManyToOne(() => Coins, (coins) => coins.coins_companies, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'coin_id' })
    coins: Coins

    // @ManyToOne(() => Companies, (companies) => companies.coins_companies, {
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    // })
    // @JoinColumn({ name: 'company_id' })
    // companies: Companies

    @OneToMany(() => Rel_Coins_Companies_Sucursal, (rel_coins_comp) => rel_coins_comp.coins_companies, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ referencedColumnName: 'id_coin_company' })
    coins_companies: Rel_Coins_Companies_Sucursal[];
}