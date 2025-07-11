import { InventoryLotsStorages } from "../entity/inventory_lots_storages.entity";
import { InventoryLotsStoragesRepository } from "../repositories/InventoryLotsStoragesRepository";
import messages from "../config/messages";
import { appDataSource } from "../app-data-source";

export class InventoryLotsStoragesService {
    /**
     * Get lot storages by variant ID with pagination
     */
    static async getStoragesByVariantId(
        inv_var_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryLot", "lot")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryLotsStorages", "user")
            .where("storage.inv_var_id = :inv_var_id", { inv_var_id })
            .orderBy("storage.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get lot storages by lot ID with pagination
     */
    static async getStoragesByLotId(
        inv_lot_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryLot", "lot")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryLotsStorages", "user")
            .where("storage.inv_lot_id = :inv_lot_id", { inv_lot_id })
            .orderBy("storage.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get lot storage by lot ID and storage ID
     */
    static async getStorageByLotAndStorage(inv_lot_id: number, id_inv_storage: number) {
        return await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryLot", "lot")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryLotsStorages", "user")
            .where("storage.inv_lot_id = :inv_lot_id", { inv_lot_id })
            .andWhere("storage.id_inv_storage = :id_inv_storage", { id_inv_storage })
            .getOne();
    }

    /**
     * Find lot storage by ID
     */
    static async findStorageById(inv_lot_storage_id: number) {
        return await InventoryLotsStoragesRepository.findOne({
            where: { inv_lot_storage_id },
            relations: ["inventoryVariant", "inventoryLot", "inventoryStorage", "usersInventoryLotsStorages"]
        });
    }

    /**
     * Create a lot storage
     */
    static async create(storageData: Partial<InventoryLotsStorages>, user_id?: number) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            // Check if storage already exists for this lot and storage location
            const existingStorage = await transactionalEntityManager
                .getRepository(InventoryLotsStorages)
                .findOne({
                    where: {
                        inv_lot_id: storageData.inv_lot_id,
                        id_inv_storage: storageData.id_inv_storage
                    }
                });

            if (existingStorage) {
                throw new Error("Storage already exists for this lot and location");
            }

            storageData.user_id = user_id;
            const newStorage = transactionalEntityManager.create(InventoryLotsStorages, storageData);
            return await transactionalEntityManager.save(InventoryLotsStorages, newStorage);
        });
    }

    /**
     * Update a lot storage
     */
    static async update(
        storage: InventoryLotsStorages,
        data: Partial<Omit<InventoryLotsStorages, "inv_lot_storage_id" | "created_at" | "updated_at">>,
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

            const updatedStorage = await transactionalEntityManager.save(InventoryLotsStorages, storage);
            return { message: messages.InventoryLotsStorages?.storage_updated ?? "Lot storage updated", data: updatedStorage };
        });
    }

    /**
     * Delete a lot storage
     */
    static async delete(inv_lot_storage_id: number) {
        const storage = await this.findStorageById(inv_lot_storage_id);
        if (!storage) {
            throw new Error("Lot storage not found");
        }

        await InventoryLotsStoragesRepository.remove(storage);
        return { message: messages.InventoryLotsStorages?.storage_deleted ?? "Lot storage deleted" };
    }

    /**
     * Update stock levels
     */
    static async updateStock(
        inv_lot_id: number,
        id_inv_storage: number,
        stockData: {
            inv_ls_stock?: number;
            inv_ls_stock_reserved?: number;
            inv_ls_stock_committed?: number;
            inv_ls_stock_prev?: number;
            inv_ls_stock_min?: number;
        },
        user_id?: number
    ) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            const storage = await transactionalEntityManager
                .getRepository(InventoryLotsStorages)
                .findOne({
                    where: { inv_lot_id, id_inv_storage }
                });

            if (!storage) {
                throw new Error("Lot storage not found");
            }

            // Update stock fields
            for (const key in stockData) {
                if (stockData[key] !== undefined) {
                    storage[key] = stockData[key];
                }
            }
            storage.updated_at = new Date();
            if (user_id) storage.user_id = user_id;

            const updatedStorage = await transactionalEntityManager.save(InventoryLotsStorages, storage);
            return { message: "Stock updated successfully", data: updatedStorage };
        });
    }

    /**
     * Get stock summary by lot ID
     */
    static async getStockSummaryByLotId(inv_lot_id: number) {
        const summary = await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .select([
                "SUM(storage.inv_ls_stock) as total_stock",
                "SUM(storage.inv_ls_stock_reserved) as total_reserved",
                "SUM(storage.inv_ls_stock_committed) as total_committed",
                "SUM(storage.inv_ls_stock_prev) as total_prev",
                "SUM(storage.inv_ls_stock_min) as total_min",
                "COUNT(storage.inv_lot_storage_id) as storage_locations"
            ])
            .where("storage.inv_lot_id = :inv_lot_id", { inv_lot_id })
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
        const [data, total] = await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryLot", "lot")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryLotsStorages", "user")
            .where("storage.id_inv_storage = :id_inv_storage", { id_inv_storage })
            .orderBy("storage.inv_ls_stock", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get lot storages by variant and lot
     */
    static async getStoragesByVariantAndLot(
        inv_var_id: number,
        inv_lot_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryLotsStoragesRepository
            .createQueryBuilder("storage")
            .leftJoinAndSelect("storage.inventoryVariant", "variant")
            .leftJoinAndSelect("storage.inventoryLot", "lot")
            .leftJoinAndSelect("storage.inventoryStorage", "storageLocation")
            .leftJoinAndSelect("storage.usersInventoryLotsStorages", "user")
            .where("storage.inv_var_id = :inv_var_id", { inv_var_id })
            .andWhere("storage.inv_lot_id = :inv_lot_id", { inv_lot_id })
            .orderBy("storage.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }
} 