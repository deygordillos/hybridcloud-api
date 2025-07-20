import { CurrenciesExchangesRepository } from "../repositories/CurrenciesExchangesRepository";
import { CurrenciesExchangesHistoryRepository } from "../repositories/CurrenciesExchangesHistoryRepository";
import { CurrenciesRepository } from "../repositories/CurrenciesRepository";
import { CurrenciesExchanges } from "../entity/currencies_exchanges.entity";
import messages from "../config/messages";

export class CurrenciesExchangesService {
    /**
     * Get all currencies for a company
     * @param company_id Company ID
     * @returns Array of currency exchanges with currency details
     */
    static async getCompanyCurrencies(company_id: number) {
        const currencies = await CurrenciesExchangesRepository
            .createQueryBuilder('ce')
            .leftJoinAndSelect('ce.currency', 'currency')
            .where('ce.company_id = :company_id', { company_id })
            .andWhere('ce.currency_exc_status = :status', { status: 1 })
            .orderBy('ce.currency_exc_type', 'ASC')
            .addOrderBy('currency.currency_name', 'ASC')
            .getMany();

        return currencies;
    }

    /**
     * Get currency exchange by ID
     * @param currency_exc_id Currency exchange ID
     * @returns Currency exchange with currency details
     */
    static async getCurrencyById(currency_exc_id: number) {
        const currency = await CurrenciesExchangesRepository
            .createQueryBuilder('ce')
            .leftJoinAndSelect('ce.currency', 'currency')
            .where('ce.currency_exc_id = :currency_exc_id', { currency_exc_id })
            .getOne();

        return currency;
    }

    /**
     * Create a new currency exchange
     * @param company_id Company ID
     * @param currencyData Currency exchange data
     * @returns Created currency exchange
     */
    static async create(company_id: number, currencyData: Partial<Omit<CurrenciesExchanges, "currency_exc_id" | "created_at" | "updated_at">>) {
        // Check if currency exists
        const currency = await CurrenciesRepository.findOne({
            where: { currency_id: currencyData.currency_id }
        });

        if (!currency) throw new Error(messages.CurrenciesExchanges.currency_not_found);

        // Check if currency exchange already exists for this company, currency and type
        const existingCurrency = await CurrenciesExchangesRepository.findOne({
            where: {
                company_id,
                currency_id: currencyData.currency_id,
                currency_exc_type: currencyData.currency_exc_type
            }
        });

        if (existingCurrency) throw new Error(messages.CurrenciesExchanges.currency_exchange_exists);

        const newCurrencyExchange = CurrenciesExchangesRepository.create(currencyData);
        const savedCurrency = await CurrenciesExchangesRepository.save(newCurrencyExchange);

        // Save to history
        await this.saveToHistory(savedCurrency);

        return savedCurrency;
    }

    /**
     * Update a currency exchange
     * @param currency_exc_id Currency exchange ID
     * @param updateData Data to update
     * @returns Updated currency exchange
     */
    static async update(currency_exc_id: number, updateData: Partial<Omit<CurrenciesExchanges, "currency_exc_id" | "created_at" | "updated_at">>) {
        const currency = await CurrenciesExchangesRepository.findOne({
            where: { currency_exc_id }
        });

        if (!currency) throw new Error(messages.CurrenciesExchanges.currency_exchange_not_exists);

        // If currency_id or currency_exc_type is being changed, check for duplicates
        if ((updateData.currency_id && updateData.currency_id !== currency.currency_id) ||
            (updateData.currency_exc_type && updateData.currency_exc_type !== currency.currency_exc_type)) {
            
            const existingCurrency = await CurrenciesExchangesRepository
                .createQueryBuilder('ce')
                .where('ce.company_id = :company_id', { company_id: currency.company_id })
                .andWhere('ce.currency_id = :currency_id', { currency_id: updateData.currency_id || currency.currency_id })
                .andWhere('ce.currency_exc_type = :currency_exc_type', { currency_exc_type: updateData.currency_exc_type || currency.currency_exc_type })
                .andWhere('ce.currency_exc_id != :currency_exc_id', { currency_exc_id })
                .getOne();

            if (existingCurrency) throw new Error(messages.CurrenciesExchanges.currency_exchange_exists);
        }

        // Save current state to history before updating
        await this.saveToHistory(currency);

        // Update the currency exchange
        Object.assign(currency, updateData);
        const updatedCurrency = await CurrenciesExchangesRepository.save(currency);

        return updatedCurrency;
    }


    /**
     * Convert amount between currencies
     * @param company_id Company ID
     * @param from_currency_id Source currency ID
     * @param to_currency_id Target currency ID
     * @param amount Amount to convert
     * @returns Conversion result
     */
    static async convertCurrency(company_id: number, from_currency_id: number, to_currency_id: number, amount: number) {
        // Get both currency exchanges
        const fromCurrency = await CurrenciesExchangesRepository.findOne({
            where: {
                company_id,
                currency_id: from_currency_id,
                currency_exc_status: 1
            }
        });

        const toCurrency = await CurrenciesExchangesRepository.findOne({
            where: {
                company_id,
                currency_id: to_currency_id,
                currency_exc_status: 1
            }
        });

        if (!fromCurrency || !toCurrency) {
            throw new Error(messages.CurrenciesExchanges.currencies_not_found);
        }

        // Calculate conversion
        let converted_amount: number;
        let exchange_rate: number;
        let exchange_method: string;

        if (from_currency_id === to_currency_id) {
            // Same currency, no conversion needed
            converted_amount = amount;
            exchange_rate = 1;
            exchange_method = 'NONE';
        } else {
            // Convert using the exchange rates
            const fromRate = fromCurrency.currency_exc_rate;
            const toRate = toCurrency.currency_exc_rate;
            
            // Calculate cross rate
            exchange_rate = toRate / fromRate;
            
            // Apply exchange method
            if (toCurrency.exchange_method === 'DIVIDE') {
                converted_amount = amount / exchange_rate;
            } else {
                converted_amount = amount * exchange_rate;
            }
            
            exchange_method = toCurrency.exchange_method;
        }

        return {
            converted_amount: Math.round(converted_amount * 100) / 100, // Round to 2 decimal places
            exchange_rate: Math.round(exchange_rate * 100000) / 100000, // Round to 5 decimal places
            exchange_method
        };
    }

    /**
     * Get currency exchange history
     * @param company_id Company ID
     * @param currency_id Optional currency ID filter
     * @param offset Pagination offset
     * @param limit Pagination limit
     * @returns History records with pagination
     */
    static async getCurrencyHistory(company_id: number, currency_id: number | null, offset: number, limit: number) {
        let query = CurrenciesExchangesHistoryRepository
            .createQueryBuilder('ceh')
            .leftJoinAndSelect('ceh.currency', 'currency')
            .where('ceh.company_id = :company_id', { company_id });

        if (currency_id) {
            query = query.andWhere('ceh.currency_id = :currency_id', { currency_id });
        }

        const total = await query.getCount();
        const history = await query
            .orderBy('ceh.created_at', 'DESC')
            .skip(offset)
            .take(limit)
            .getMany();

        return { total, history };
    }

    /**
     * Set base currency for company
     * @param company_id Company ID
     * @param currency_id Currency ID to set as base
     */
    static async setBaseCurrency(company_id: number, currency_id: number) {
        // First, remove base currency status from all currencies in the company
        await CurrenciesExchangesRepository
            .createQueryBuilder()
            .update(CurrenciesExchanges)
            .set({ currency_exc_type: 1 }) // Set all to local
            .where('company_id = :company_id', { company_id })
            .andWhere('currency_exc_type = :type', { type: 1 }) // Only local currencies can be base
            .execute();

        // Set the specified currency as base (type 1 = local)
        const currency = await CurrenciesExchangesRepository.findOne({
            where: {
                company_id,
                currency_id,
                currency_exc_status: 1
            }
        });

        if (!currency) {
            throw new Error(messages.CurrenciesExchanges.currency_not_found);
        }

        currency.currency_exc_type = 1; // Set as local (base)
        await CurrenciesExchangesRepository.save(currency);

        // Save to history
        await this.saveToHistory(currency);
    }

    /**
     * Save currency exchange to history
     * @param currencyExchange Currency exchange to save
     */
    private static async saveToHistory(currencyExchange: CurrenciesExchanges | CurrenciesExchanges[]) {
        if (Array.isArray(currencyExchange)) {
            for (const currency of currencyExchange) {
                await this.saveToHistory(currency);
            }
            return;
        }
        const historyRecord = CurrenciesExchangesHistoryRepository.create({
            company_id: currencyExchange.company_id,
            currency_id: currencyExchange.currency_id,
            currency_exc_rate: currencyExchange.currency_exc_rate,
            currency_exc_type: currencyExchange.currency_exc_type,
            exchange_method: currencyExchange.exchange_method
        });

        await CurrenciesExchangesHistoryRepository.save(historyRecord);
    }
} 