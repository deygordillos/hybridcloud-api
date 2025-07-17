import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Companies } from "./companies.entity";
import { Currencies } from "./currencies.entity";

@Entity('currencies_exchanges_history')
export class CurrenciesExchangesHistory {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    currency_exc_hist_id: number;

    @Column({ type: 'int', unsigned: true })
    company_id: number;

    @Column({ type: 'int', unsigned: true })
    currency_from_id: number;

    @Column({ type: 'int', unsigned: true })
    currency_to_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 5, comment: 'Exchange rate' })
    currency_exc_rate: number;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    // Relations
    @ManyToOne(() => Companies, company => company.currency_exchanges_history)
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @ManyToOne(() => Currencies, currency => currency.currency_exchanges_history_from)
    @JoinColumn({ name: 'currency_from_id' })
    currency_from: Currencies;

    @ManyToOne(() => Currencies, currency => currency.currency_exchanges_history_to)
    @JoinColumn({ name: 'currency_to_id' })
    currency_to: Currencies;
} 