import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { CurrenciesExchanges } from "./currencies_exchanges.entity";
import { CurrenciesExchangesHistory } from "./currencies_exchanges_history.entity";

@Entity('currencies')
export class Currencies {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    currency_id: number;

    @Column({ type: 'varchar', length: 5, comment: 'ISO code of the currency' })
    currency_iso_code: string;

    @Column({ type: 'varchar', length: 40, comment: 'Name of the currency' })
    currency_name: string;

    @Column({ type: 'varchar', length: 10, comment: 'Symbol of the currency' })
    currency_symbol: string;

    @Column({ type: 'tinyint', width: 1, default: 1, comment: '1: Active, 0: Inactive' })
    currency_status: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    // Relations
    @OneToMany(() => CurrenciesExchanges, currencyExchange => currencyExchange.currency)
    currency_exchanges: CurrenciesExchanges[];

    @OneToMany(() => CurrenciesExchangesHistory, currencyExchangeHist => currencyExchangeHist.currency)
    currency_exchanges_history: CurrenciesExchangesHistory[];
} 