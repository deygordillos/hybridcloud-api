import messages from "../config/messages";
import { InventoryStorage } from "../entity/inventoryStorage.entity";
import { InventoryStorageRepository } from "../repositories/InventoryStorageRepository";

export class InventoryStorageService {
    /**
     * Get inventory storages by company id
     * @param company_id Company ID
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @param status Storage status (1 active, 0 inactive)
     * @returns InventoryStorage and total count
     */
    static async getInventoryStorageByCompanyId(
        company_id: number,
        offset: number = 0,
        limit: number = 10,
        status: number = 1
    ) {
        const [data, total] = await InventoryStorageRepository
            .createQueryBuilder("invstorage")
            .where("invstorage.company_id = :company_id", { company_id })
            .andWhere("invstorage.inv_storage_status = :status", { status })
            .orderBy("invstorage.id_inv_storage", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    static async findInventoryStorageByCode(inv_storage_code: string) {
        return await InventoryStorageRepository.findOneBy({ inv_storage_code });
    }

    static async findInventoryStorageById(id_inv_storage: number) {
        return await InventoryStorageRepository.findOneBy({ id_inv_storage });
    }

    /**
     * Create an inventory storage
     * @param data Inventory Storage data
     * @returns 
     */
    static async create(inventoryStorage: Pick<InventoryStorage, "company_id" | "inv_storage_code" | "inv_storage_name" | "inv_storage_status">) {
        const newInventoryS = InventoryStorageRepository.create(inventoryStorage);
        await InventoryStorageRepository.save(newInventoryS);

        return newInventoryS;
    }

    /**
     * Update an inventory storage
     * @param inv_storage 
     * @param data 
     * @returns 
     */
    static async update(inv_storage: InventoryStorage, data: Pick<InventoryStorage, "inv_storage_name" | "inv_storage_status">) {
        inv_storage.inv_storage_name = data.inv_storage_name.length > 0 ? data.inv_storage_name : inv_storage.inv_storage_name;
        inv_storage.inv_storage_status = (data.inv_storage_status === 0 || data.inv_storage_status === 1) ? data.inv_storage_status : 1;
        inv_storage.updated_at = new Date();

        await InventoryStorageRepository.save(inv_storage);
        return { message: messages.InventoryStorage?.invStorage_updated ?? "Inventory Storage updated" };
    }
}