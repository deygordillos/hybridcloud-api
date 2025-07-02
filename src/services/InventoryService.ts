import { Inventory } from "../entity/inventory.entity";
import { InventoryRepository } from "../repositories/InventoryRepository";
import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";
import { appDataSource } from "../app-data-source";
import { InventoryTaxes } from "../entity/inventory_taxes.entity";

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
            .leftJoinAndSelect("inv.inventoryTaxes", "invtaxes")
            .leftJoinAndSelect("invtaxes.tax", "taxes")
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
    static async findInventoryByCode(company_id: Companies, inv_code: string) {
        return await InventoryRepository
            .createQueryBuilder("inv")
            .innerJoinAndSelect("inv.inventoryFamily", "family")
            .where("family.company_id = :company_id", { company_id })
            .andWhere("inv.inv_code = :inv_code", { inv_code })
            .getOne();
    }

    /**
     * Find inventory by id
     */
    static async findInventoryById(inv_id: number) {
        return await InventoryRepository.findOneBy({ inv_id });
    }

    /**
     * Create an inventory
     * @param inventory Inventory
     * @param taxes Taxes. Optional
     */
    static async create(inventory: Partial<Inventory>, taxes: number[] = []) {
        return await appDataSource.transaction(async transactionalEntityManager => {

            const newInventory = transactionalEntityManager.create(Inventory, inventory);
            await transactionalEntityManager.save(newInventory);

            // Validar y asociar taxes
            if (taxes && taxes.length > 0) {
                // Validar que todos los taxes existen
                const foundTaxes = await transactionalEntityManager
                    .getRepository("Taxes")
                    .createQueryBuilder("tax")
                    .whereInIds(taxes)
                    .getMany();

                if (foundTaxes.length !== taxes.length) {
                    throw new Error("One or more tax IDs do not exist");
                }

                // Asociar taxes
                const invTaxes = taxes.map(tax_id => {
                    return transactionalEntityManager.create(InventoryTaxes, {
                        inv_id: newInventory.inv_id,
                        tax_id
                    });
                });
                await transactionalEntityManager.save(invTaxes);
            }

            return newInventory;
        });
    }

    /**
     * Update an inventory
     */
    static async update(
        inventory: Inventory,
        data: Partial<Omit<Inventory, "inv_id" | "id_inv_family" | "created_at" | "updated_at">>
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