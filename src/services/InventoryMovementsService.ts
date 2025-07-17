import { InventoryMovements } from "../entity/inventory_movements.entity";
import { InventoryMovementsRepository } from "../repositories/InventoryMovementsRepository";
import messages from "../config/messages";
import { appDataSource } from "../app-data-source";

export class InventoryMovementsService {
    /**
     * Get movements by variant ID with pagination
     */
    static async getMovementsByVariantId(
        inv_var_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.inv_var_id = :inv_var_id", { inv_var_id })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get movements by lot ID with pagination
     */
    static async getMovementsByLotId(
        inv_lot_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.inv_lot_id = :inv_lot_id", { inv_lot_id })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get movements by storage ID with pagination
     */
    static async getMovementsByStorageId(
        id_inv_storage: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.id_inv_storage = :id_inv_storage", { id_inv_storage })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get movements by type with pagination
     */
    static async getMovementsByType(
        movement_type: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.movement_type = :movement_type", { movement_type })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get movements by user ID with pagination
     */
    static async getMovementsByUserId(
        user_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.user_id = :user_id", { user_id })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Find movement by ID
     */
    static async findMovementById(inv_storage_move_id: number) {
        return await InventoryMovementsRepository.findOne({
            where: { inv_storage_move_id },
            relations: ["inventoryVariant", "inventoryLot", "inventoryStorage", "usersInventoryMovements"]
        });
    }

    /**
     * Create a movement
     */
    static async create(movementData: Partial<InventoryMovements>, user_id?: number) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            movementData.user_id = user_id;
            const newMovement = transactionalEntityManager.create(InventoryMovements, movementData);
            return await transactionalEntityManager.save(InventoryMovements, newMovement);
        });
    }

    /**
     * Update a movement
     */
    static async update(
        movement: InventoryMovements,
        data: Partial<Omit<InventoryMovements, "inv_storage_move_id" | "created_at" | "updated_at">>,
        user_id?: number
    ) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            for (const key in data) {
                if (data[key] !== undefined) {
                    movement[key] = data[key];
                }
            }
            movement.updated_at = new Date();
            if (user_id) movement.user_id = user_id;

            const updatedMovement = await transactionalEntityManager.save(InventoryMovements, movement);
            return { message: messages.InventoryMovements?.movement_updated ?? "Inventory movement updated", data: updatedMovement };
        });
    }

    /**
     * Delete a movement
     */
    static async delete(inv_storage_move_id: number) {
        const movement = await this.findMovementById(inv_storage_move_id);
        if (!movement) {
            throw new Error("Inventory movement not found");
        }

        await InventoryMovementsRepository.remove(movement);
        return { message: messages.InventoryMovements?.movement_deleted ?? "Inventory movement deleted" };
    }

    /**
     * Get movement statistics
     */
    static async getMovementStatistics(
        startDate?: Date,
        endDate?: Date,
        movement_type?: number
    ) {
        const queryBuilder = InventoryMovementsRepository
            .createQueryBuilder("movement")
            .select([
                "COUNT(movement.inv_storage_move_id) as total_movements",
                "SUM(CASE WHEN movement.movement_type = 1 THEN movement.quantity ELSE 0 END) as total_in",
                "SUM(CASE WHEN movement.movement_type = 2 THEN movement.quantity ELSE 0 END) as total_out",
                "SUM(CASE WHEN movement.movement_type = 3 THEN movement.quantity ELSE 0 END) as total_transfer",
                "COUNT(DISTINCT movement.inv_var_id) as unique_variants",
                "COUNT(DISTINCT movement.id_inv_storage) as unique_storages"
            ]);

        if (startDate) {
            queryBuilder.andWhere("movement.created_at >= :startDate", { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere("movement.created_at <= :endDate", { endDate });
        }

        if (movement_type !== undefined) {
            queryBuilder.andWhere("movement.movement_type = :movement_type", { movement_type });
        }

        return await queryBuilder.getRawOne();
    }

    /**
     * Get movements by date range
     */
    static async getMovementsByDateRange(
        startDate: Date,
        endDate: Date,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.created_at >= :startDate", { startDate })
            .andWhere("movement.created_at <= :endDate", { endDate })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get movements by related document
     */
    static async getMovementsByRelatedDoc(
        related_doc: string,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .where("movement.related_doc = :related_doc", { related_doc })
            .orderBy("movement.created_at", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get latest movements
     */
    static async getLatestMovements(limit: number = 10) {
        return await InventoryMovementsRepository
            .createQueryBuilder("movement")
            .leftJoinAndSelect("movement.inventoryVariant", "variant")
            .leftJoinAndSelect("movement.inventoryLot", "lot")
            .leftJoinAndSelect("movement.inventoryStorage", "storage")
            .leftJoinAndSelect("movement.usersInventoryMovements", "user")
            .orderBy("movement.created_at", "DESC")
            .limit(limit)
            .getMany();
    }
} 