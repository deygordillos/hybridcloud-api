import { CurrenciesRepository } from "../repositories/CurrenciesRepository";

export class CurrenciesService {
    /**
     * Get currencies catalog with pagination and status filter
     */
    static async getCurrencies(
        offset: number = 0,
        limit: number = 100,
        currency_status: number = 1
    ) {
        const [data, total] = await CurrenciesRepository
            .createQueryBuilder("currency")
            .where("currency.currency_status = :currency_status", { currency_status })
            .orderBy("currency.currency_iso_code", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Find currency by id
     */
    static async findCurrencyById(currency_id: number) {
        return await CurrenciesRepository.findOneBy({ currency_id });
    }
}
