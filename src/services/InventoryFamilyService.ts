import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";
import { InventoryFamily } from "../entity/inventoryFamily.entity";
import { InventoryFamilyRepository } from "../repositories/InventoryFamilyRepository";

export class InventoryFamilyService {
    /**
     * Get inventory families by company id
     * @param company_id Company ID
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @returns InventoryFamily and total count
     */
    static async getInventoryFamilyByCompanyId(company_id: number, offset: number = 0, limit: number = 10, status: number = 1) {
        const [data, total] = await InventoryFamilyRepository
            .createQueryBuilder("invfamily")
            .where("invfamily.company_id = :company_id", { company_id })
            .andWhere("invfamily.inv_family_status = :status", {status})
            .orderBy("invfamily.id_inv_family", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount(); // Obtiene datos + total de registros

        return { data, total };
    }

    static async findInventoryFamilyByCode(inv_family_code: string) {
        return await InventoryFamilyRepository.findOneBy({ inv_family_code });
    }

    static async findInventoryFamilyById(id_inv_family: number) {
        return await InventoryFamilyRepository.findOneBy({ id_inv_family });
    }
    
    /**
     * Create an inventory family
     * @param data Inventory Family data
     * @returns 
     */
    static async create(inventoryFamily: Pick<InventoryFamily, "company_id" | "inv_family_code" | "inv_family_name" | "inv_family_status" | "inv_is_stockable" | "inv_is_lot_managed" | "tax_id">) {
        const newInventoryF = InventoryFamilyRepository.create(inventoryFamily);
        await InventoryFamilyRepository.save(newInventoryF);

        return newInventoryF;
    }

    /**
     * Update an inventory family
     * @param inv_family 
     * @param customerData 
     * @returns 
     */
    static async update(inv_family: InventoryFamily, data: Pick<InventoryFamily, "inv_family_name" | "inv_family_status" | "inv_is_stockable" | "inv_is_lot_managed" | "tax_id">) {
        inv_family.inv_family_name = data.inv_family_name.length > 0 ? data.inv_family_name : inv_family.inv_family_name;
        inv_family.inv_family_status = (data.inv_family_status === 0 || data.inv_family_status === 1) ? data.inv_family_status : 1;
        inv_family.inv_is_stockable = (data.inv_is_stockable === 0 || data.inv_is_stockable === 1) ? data.inv_is_stockable : 1;
        inv_family.inv_is_lot_managed = (data.inv_is_lot_managed === 0 || data.inv_is_lot_managed === 1) ? data.inv_is_lot_managed : 0;
        inv_family.tax_id = data.tax_id ?? inv_family.tax_id;
        inv_family.updated_at = new Date();

        await InventoryFamilyRepository.save(inv_family);
        return { message: messages.InventoryFamily.invFamily_updated };
    }

}