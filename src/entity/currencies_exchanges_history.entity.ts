import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { Companies } from "./companies.entity";
import { Currencies } from "./currencies.entity";

@Index('currency_exc_hist_company_currency_exc_type_unique', ['company_id', 'currency_id', 'currency_exc_type'])
@Entity('currencies_exchanges_history')
export class CurrenciesExchangesHistory {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    currency_exc_hist_id: number;

    @Column({ type: 'int', unsigned: true })
    company_id: number;

    @Column({ type: 'int', unsigned: true })
    currency_id: number;

    @Column({ type: 'decimal', precision: 18, scale: 8, comment: 'Exchange rate' })
    currency_exc_rate: number;

    @Column({ type: 'tinyint', width: 1, default: 1, nullable: false, comment: '1: local, 2: stable, 3: ref' })
    currency_exc_type: number;

    @Column({ type: 'tinyint', width: 1, default: 2, comment: '1: DIVIDE, 2: MULTIPLY' })
    exchange_method: number;

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