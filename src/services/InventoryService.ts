import { Inventory } from "../entity/inventory.entity";
import { InventoryRepository } from "../repositories/InventoryRepository";
import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";
import { InventoryFamily } from "../entity/inventoryFamily.entity";

export class InventoryService {
    /**
     * Get inventories by company id with pagination and status
     */
    static async getInventoriesByCompanyId(
        company_id: Companies,
        offset: number = 0,
        limit: number = 10,
        inv_status: number = 1
    ) {
        const [data, total] = await InventoryRepository
            .createQueryBuilder("inv")
            .innerJoinAndSelect("inv.inventoryFamily", "family")
            .where("family.company_id = :company_id", { company_id })
            .andWhere("inv.inv_status = :inv_status", { inv_status })
            .orderBy("inv.inv_id", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Find inventory by code and product family company
     */
    static async findInventoryByCode(id_inv_family: InventoryFamily, inv_code: string) {
        return await InventoryRepository.findOne({
            where: { id_inv_family, inv_code }
        });
    }

    /**
     * Find inventory by id
     */
    static async findInventoryById(inv_id: number) {
        return await InventoryRepository.findOneBy({ inv_id });
    }

    /**
     * Create an inventory
     */
    static async create(inventory: Partial<Inventory>) {
        const newInventory = InventoryRepository.create(inventory);
        await InventoryRepository.save(newInventory);
        return newInventory;
    }

    /**
     * Update an inventory
     */
    static async update(
        inventory: Inventory,
        data: Partial<Omit<Inventory, "inv_id" | "company_id" | "created_at" | "updated_at">>
    ) {
        for (const key in data) {
            if (data[key] !== undefined) {
                inventory[key] = data[key];
            }
        }
        inventory.updated_at = new Date();

        await InventoryRepository.save(inventory);
        return { message: messages.Inventory?.inv_updated ?? "Inventory updated", data: inventory };
    }
}