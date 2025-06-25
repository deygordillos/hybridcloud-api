import { Inventory } from "../entity/inventory.entity";
import { Taxes } from "../entity/taxes.entity";
import { InventoryTaxesRepository } from "../repositories/InventoryTaxesRepository";

export class InventoryTaxesService {

    /**
     * Create a new inventory-taxes association
     */
    static async create(inv_id: number, tax_id: number) {
        const invTax = InventoryTaxesRepository.create({ inv_id, tax_id });
        return await InventoryTaxesRepository.save(invTax);
    }

    /**
     * Bulk create inventory-taxes associations
     */
    static async bulkCreate(inv_id: number, taxes: number[]) {
        const records = taxes.map(tax_id => ({ inv_id, tax_id }));
        return await InventoryTaxesRepository.save(records);
    }
}