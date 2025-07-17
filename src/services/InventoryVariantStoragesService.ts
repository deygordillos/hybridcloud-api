import { InventoryVariantStorages } from "../entity/inventory_variant_storages.entity";
import { InventoryVariantStoragesRepository } from "../repositories/InventoryVariantStoragesRepository";
import messages from "../config/messages";
import { appDataSource } from "../app-data-source";

export class InventoryVariantStoragesService {
    /**
     * Get variant storages by variant ID with pagination
     */
    static async getStoragesByVariantId(
        inv_var_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryVariantStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryVariantStorages", "user")
            .where("storage.inv_var_id = :inv_var_id", { inv_var_id })
            .orderBy("storage.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get variant storage by variant ID and storage ID
     */
    static async getStorageByVariantAndStorage(inv_var_id: number, id_inv_storage: number) {
        return await InventoryVariantStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryVariantStorages", "user")
            .where("storage.inv_var_id = :inv_var_id", { inv_var_id })
            .andWhere("storage.id_inv_storage = :id_inv_storage", { id_inv_storage })
            .getOne();
    }

    /**
     * Find variant storage by ID
     */
    static async findStorageById(inv_var_storage_id: number) {
        return await InventoryVariantStoragesRepository.findOne({
            where: { inv_var_storage_id },
            relations: ["inventoryVariant", "inventoryStorage", "usersInventoryVariantStorages"]
        });
    }

    /**
     * Create a variant storage
     */
    static async create(storageData: Partial<InventoryVariantStorages>, user_id?: number) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            // Check if storage already exists for this variant and storage location
            const existingStorage = await transactionalEntityManager
                .getRepository(InventoryVariantStorages)
                .findOne({
                    where: {
                        inv_var_id: storageData.inv_var_id,
                        id_inv_storage: storageData.id_inv_storage
                    }
                });

            if (existingStorage) {
                throw new Error("Storage already exists for this variant and location");
            }

            storageData.user_id = user_id;
            const newStorage = transactionalEntityManager.create(InventoryVariantStorages, storageData);
            return await transactionalEntityManager.save(InventoryVariantStorages, newStorage);
        });
    }

    /**
     * Update a variant storage
     */
    static async update(
        storage: InventoryVariantStorages,
        data: Partial<Omit<InventoryVariantStorages, "inv_var_storage_id" | "created_at" | "updated_at">>,
        user_id?: number
    ) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            for (const key in data) {
                if (data[key] !== undefined) {
                    storage[key] = data[key];
                }
            }
            storage.updated_at = new Date();
            if (user_id) storage.user_id = user_id;

            const updatedStorage = await transactionalEntityManager.save(InventoryVariantStorages, storage);
            return { message: messages.InventoryVariantStorages?.storage_updated ?? "Variant storage updated", data: updatedStorage };
        });
    }

    /**
     * Delete a variant storage
     */
    static async delete(inv_var_storage_id: number) {
        const storage = await this.findStorageById(inv_var_storage_id);
        if (!storage) {
            throw new Error("Variant storage not found");
        }

        await InventoryVariantStoragesRepository.remove(storage);
        return { message: messages.InventoryVariantStorages?.storage_deleted ?? "Variant storage deleted" };
    }

    /**
     * Update stock levels
     */
    static async updateStock(
        inv_var_id: number,
        id_inv_storage: number,
        stockData: {
            inv_vs_stock?: number;
            inv_vs_stock_reserved?: number;
            inv_vs_stock_committed?: number;
            inv_vs_stock_prev?: number;
            inv_vs_stock_min?: number;
        },
        user_id?: number
    ) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            const storage = await transactionalEntityManager
                .getRepository(InventoryVariantStorages)
                .findOne({
                    where: { inv_var_id, id_inv_storage }
                });

            if (!storage) {
                throw new Error("Variant storage not found");
            }

            // Update stock fields
            for (const key in stockData) {
                if (stockData[key] !== undefined) {
                    storage[key] = stockData[key];
                }
            }
            storage.updated_at = new Date();
            if (user_id) storage.user_id = user_id;

            const updatedStorage = await transactionalEntityManager.save(InventoryVariantStorages, storage);
            return { message: "Stock updated successfully", data: updatedStorage };
        });
    }

    /**
     * Get stock summary by variant ID
     */
    static async getStockSummaryByVariantId(inv_var_id: number) {
        const summary = await InventoryVariantStoragesRepository
            .createQueryBuilder("storage")
            .select([
                "SUM(storage.inv_vs_stock) as total_stock",
                "SUM(storage.inv_vs_stock_reserved) as total_reserved",
                "SUM(storage.inv_vs_stock_committed) as total_committed",
                "SUM(storage.inv_vs_stock_prev) as total_prev",
                "SUM(storage.inv_vs_stock_min) as total_min",
                "COUNT(storage.inv_var_storage_id) as storage_locations"
            ])
            .where("storage.inv_var_id = :inv_var_id", { inv_var_id })
            .getRawOne();

        return summary;
    }

    /**
     * Get storages by storage location ID
     */
    static async getStoragesByLocationId(
        id_inv_storage: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryVariantStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryVariantStorages", "user")
            .where("storage.id_inv_storage = :id_inv_storage", { id_inv_storage })
            .orderBy("storage.inv_vs_stock", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }
} 