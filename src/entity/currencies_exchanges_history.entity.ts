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
    currency_id: number;

    @Column({ type: 'decimal', precision: 10, scale: 5, comment: 'Exchange rate' })
    currency_exc_rate: number;

    @Column({ type: 'tinyint', width: 1, default: 0, comment: '1: Base currency, 0: Not base currency' })
    is_base_currency: number;

    @Column({ type: 'enum', enum: ['DIVIDE', 'MULTIPLY'], default: 'MULTIPLY', comment: 'Method to calculate exchange rate' })
    exchange_method: string;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    // Relations
    @ManyToOne(() => Companies, company => company.currency_exchanges_history)
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @ManyToOne(() => Currencies, currency => currency.currency_exchanges_history)
    @JoinColumn({ name: 'currency_id' })
    currency: Currencies;
} 