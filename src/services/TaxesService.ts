import { Taxes } from "../entity/taxes.entity";
import { TaxesRepository } from "../repositories/TaxesRepository";
import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";

export class TaxesService {
    /**
     * Get taxes by company id with pagination and status
     */
    static async getTaxesByCompanyId(
        company_id: number,
        offset: number = 0,
        limit: number = 10,
        tax_status: number = 1
    ) {
        const [data, total] = await TaxesRepository
            .createQueryBuilder("tax")
            .where("tax.company_id = :company_id", { company_id })
            .andWhere("tax.tax_status = :tax_status", { tax_status })
            .orderBy("tax.tax_id", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Find tax by code and company
     */
    static async findTaxByCode(company_id: Companies, tax_code: string) {
        return await TaxesRepository.findOneBy({ company_id, tax_code });
    }

    /**
     * Find tax by id
     */
    static async findTaxById(tax_id: number) {
        return await TaxesRepository.findOneBy({ tax_id });
    }

    /**
     * Create a tax
     */
    static async create(tax: Pick<Taxes, "company_id" | "tax_code" | "tax_name" | "tax_description" | "tax_status" | "tax_type" | "tax_value">) {
        const newTax = TaxesRepository.create(tax);
        await TaxesRepository.save(newTax);
        return newTax;
    }

    /**
     * Update a tax
     */
    static async update(tax: Taxes, data: Pick<Taxes, "tax_name" | "tax_description" | "tax_status" | "tax_type" | "tax_value">) {
        console.log({data});
        tax.tax_name = data.tax_name ?? tax.tax_name;
        tax.tax_description = data.tax_description ?? tax.tax_description;
        tax.tax_status = (data.tax_status === 0 || data.tax_status === 1) ? data.tax_status : tax.tax_status;
        tax.tax_type = (data.tax_type === 1 || data.tax_type === 2) ? data.tax_type : tax.tax_type;
        tax.tax_value = typeof data.tax_value === "number" ? data.tax_value : tax.tax_value;
        tax.updated_at = new Date();

        await TaxesRepository.save(tax);
        return { message: messages.Tax?.tax_updated ?? "Tax updated", data: tax };
    }
}