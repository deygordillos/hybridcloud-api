import { Inventory } from "../entity/inventory.entity";
import { InventoryRepository } from "../repositories/InventoryRepository";
import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";
import { appDataSource } from "../app-data-source";
import { InventoryTaxes } from "../entity/inventory_taxes.entity";
import { InventoryVariants } from "../entity/inventory_variants.entity";

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
    static async create(inventory: Partial<Inventory>, taxes: number[] = [], variants: any[] = []) {
        return await appDataSource.transaction(async transactionalEntityManager => {

            const newInventory = transactionalEntityManager.create(Inventory, inventory);
            await transactionalEntityManager.save(newInventory);

            // Associate taxes if provided
            if (taxes && taxes.length > 0) {
                // Validate that all tax IDs exist
                const foundTaxes = await transactionalEntityManager
                    .getRepository("Taxes")
                    .createQueryBuilder("tax")
                    .whereInIds(taxes)
                    .getMany();

                if (foundTaxes.length !== taxes.length) {
                    throw new Error("One or more tax IDs do not exist");
                }

                const invTaxes = taxes.map(tax_id => {
                    return transactionalEntityManager.create(InventoryTaxes, {
                        inv_id: newInventory.inv_id,
                        tax_id
                    });
                });
                await transactionalEntityManager.save(invTaxes);
            }

            // Associate variants if provided
            if (variants.length > 0) {
                for (const variant of variants) {
                    // variant debe tener al menos inv_var_sku y un array de atributos (attr_values)
                    const { inv_var_sku, inv_var_status = 1, attr_values = [] } = variant;

                    let existsVariant = await transactionalEntityManager
                        .getRepository("InventoryVariants")
                        .findOne({ where: { inv_id: newInventory.inv_id, inv_var_sku } });
                    if (existsVariant) throw new Error(`Variant with SKU ${inv_var_sku} already exists for this inventory`);

                    // Create the variant
                    const createdVariant = transactionalEntityManager.create(InventoryVariants, {
                        inv_id: newInventory.inv_id,
                        inv_var_sku,
                        inv_var_status
                    });
                    await transactionalEntityManager.save(InventoryVariants, createdVariant);

                    // Associate attributes if provided
                    if (Array.isArray(attr_values) && attr_values.length > 0) {
                        // Validate that all attribute values exist
                        const foundAttrValues = await transactionalEntityManager
                            .getRepository("InventoryVariantsAttrs")
                            .createQueryBuilder("var_attr")
                            .whereInIds(attr_values)
                            .getMany();

                        if (foundAttrValues.length !== attr_values.length) {
                            throw new Error("One or more attribute values do not exist");
                        }
                        
                        const attrRecords = attr_values.map(inv_attrval_id => ({
                            inv_var_id: createdVariant.inv_var_id,
                            inv_attrval_id
                        }));
                        await transactionalEntityManager
                            .getRepository("InventoryVariantsAttrs")
                            .save(attrRecords);
                    }
                }
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