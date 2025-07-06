import { InventoryAttrs } from "../entity/inventory_attrs.entity";
import { InventoryAttrsValues } from "../entity/inventory_attrs_values.entity";
import { InventoryAttrsRepository } from "../repositories/InventoryAttrsRepository";
import { InventoryAttrsValuesRepository } from "../repositories/InventoryAttrsValuesRepository";

export class InventoryAttrsService {

    /**
     * Get all attributes by company
     */
    static async getAllByCompany(company_id: number) {
        return await InventoryAttrsRepository.find({
            where: { company_id },
            relations: ["attr_values"],
        });
    }

    /**
     * Find an attribute by ID
     * @param company_id Company ID
     * @param inv_attr_id Attribute Id
     */
    static async findById(company_id: number, inv_attr_id: number) {
        return await InventoryAttrsRepository.findOne({ where: { company_id, inv_attr_id }, relations: ["attr_values"] });
    }

    /**
     * Find an attribute by name and company
     * @param company_id Company ID
     * @param attr_name Attribute name
     * @returns InventoryAttrs or null if not found
     */
    static async findByName(company_id: number, attr_name: string) {
        return await InventoryAttrsRepository.findOne({ where: { company_id, attr_name } });
    }

    /**
     * Create a new attribute
     */
    static async create(data: Pick<InventoryAttrs, "attr_name">) {
        const attr = InventoryAttrsRepository.create(data);
        return await InventoryAttrsRepository.save(attr);
    }

    /**
     * Update an attribute
     */
    static async update(company_id: number, inv_attr_id: number, data: Pick<InventoryAttrs, "attr_name" | "attr_description" | "attr_status">) {
        const existingAttr = await this.findById(company_id, inv_attr_id);
        if (!existingAttr) throw new Error(`Attribute with ID ${inv_attr_id} not found for company`);

        await InventoryAttrsRepository.update(inv_attr_id, data);
        return await this.findById(company_id, inv_attr_id);
    }

    /**
     * Create a new attribute value
     * @param data Attribute value data
     * @returns InventoryAttrsValues or null if not created
     */
    static async createAttrValue(data: Partial<InventoryAttrsValues>) {
        const attrValue = InventoryAttrsValuesRepository.create(data);
        return await InventoryAttrsValuesRepository.save(attrValue);
    }

    static async findAttrValue(inv_attr_id: number, attr_value: string) {
        return await InventoryAttrsValuesRepository.findOne({ where: { inv_attr_id, attr_value } });
    }
}