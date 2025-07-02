import { TypesOfPrices } from '../entity/types_of_prices.entity';
import { TypesOfPricesRepository } from '../repositories/TypesOfPricesRepository';

export class TypesOfPricesService {

    /**
     * Get all types of prices for a company
     */
    static async getAllByCompany(company_id: number, offset: number = 0, limit: number = 10, typeprice_status: number = 1) {
        const [data, total] = await TypesOfPricesRepository
            .createQueryBuilder("tp")
            .where("tp.company_id = :company_id", { company_id })
            .andWhere("tp.typeprice_status = :typeprice_status", { typeprice_status })
            .orderBy("tp.typeprice_id", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Find a type of price by ID
     */
    static async findById(typeprice_id: number) {
        return await TypesOfPricesRepository.findOne({ where: { typeprice_id } });
    }

    /**
     * Find a type of price by company and name
     */
    static async findByCompanyAndName(company_id: number, typeprice_name: string) {
        return await TypesOfPricesRepository.findOne({
            where: {
                company_id,
                typeprice_name
            }
        });
    }

    /**
     * Create a new type of price
     */
    static async create(data: Partial<TypesOfPrices>) {
        const newType = TypesOfPricesRepository.create(data);
        return await TypesOfPricesRepository.save(newType);
    }

    /**
     * Update a type of price
     */
    static async update(typeprice_id: number, data: Partial<TypesOfPrices>) {
        await TypesOfPricesRepository.update(typeprice_id, data);
        return await this.findById(typeprice_id);
    }

    /**
     * Delete a type of price
     */
    static async delete(typeprice_id: number) {
        return await TypesOfPricesRepository.delete(typeprice_id);
    }
}