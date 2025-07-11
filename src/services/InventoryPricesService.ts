import { InventoryPrices } from "../entity/inventory_prices.entity";
import { InventoryPricesRepository } from "../repositories/InventoryPricesRepository";
import messages from "../config/messages";
import { appDataSource } from "../app-data-source";

export class InventoryPricesService {
    /**
     * Get inventory prices by variant ID with pagination
     */
    static async getPricesByVariantId(
        inv_var_id: number,
        offset: number = 0,
        limit: number = 10
    ) {
        const [data, total] = await InventoryPricesRepository
            .createQueryBuilder("prices")
            .leftJoinAndSelect("prices.inventoryVariant", "variant")
            .leftJoinAndSelect("prices.typeOfPrice", "typeOfPrice")
            .where("prices.inv_var_id = :inv_var_id", { inv_var_id })
            .orderBy("prices.valid_from", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Get current prices by variant ID
     */
    static async getCurrentPricesByVariantId(inv_var_id: number) {
        return await InventoryPricesRepository
            .createQueryBuilder("prices")
            .leftJoinAndSelect("prices.inventoryVariant", "variant")
            .leftJoinAndSelect("prices.typeOfPrice", "typeOfPrice")
            .where("prices.inv_var_id = :inv_var_id", { inv_var_id })
            .andWhere("prices.is_current = :is_current", { is_current: 1 })
            .getMany();
    }

    /**
     * Find inventory price by ID
     */
    static async findPriceById(inv_price_id: number) {
        return await InventoryPricesRepository.findOne({
            where: { inv_price_id },
            relations: ["inventoryVariant", "typeOfPrice"]
        });
    }

    /**
     * Find inventory price by variant and type
     */
    static async findPriceByVariantAndType(inv_var_id: number, typeprice_id: number) {
        return await InventoryPricesRepository.findOne({
            where: { inv_var_id, typeprice_id },
            relations: ["inventoryVariant", "typeOfPrice"]
        });
    }

    /**
     * Create an inventory price
     */
    static async create(priceData: Partial<InventoryPrices>) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            // If this is set as current, unset other current prices for this variant and type
            if (priceData.is_current === 1) {
                await transactionalEntityManager
                    .getRepository(InventoryPrices)
                    .update(
                        { 
                            inv_var_id: priceData.inv_var_id, 
                            typeprice_id: priceData.typeprice_id,
                            is_current: 1 
                        },
                        { is_current: 0 }
                    );
            }

            const newPrice = transactionalEntityManager.create(InventoryPrices, priceData);
            return await transactionalEntityManager.save(InventoryPrices, newPrice);
        });
    }

    /**
     * Update an inventory price
     */
    static async update(
        price: InventoryPrices,
        data: Partial<Omit<InventoryPrices, "inv_price_id" | "created_at" | "updated_at">>
    ) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            // If this is being set as current, unset other current prices for this variant and type
            if (data.is_current === 1) {
                await transactionalEntityManager
                    .getRepository(InventoryPrices)
                    .update(
                        { 
                            inv_var_id: price.inv_var_id, 
                            typeprice_id: price.typeprice_id,
                            is_current: 1,
                            inv_price_id: price.inv_price_id // Exclude current record
                        },
                        { is_current: 0 }
                    );
            }

            for (const key in data) {
                if (data[key] !== undefined) {
                    price[key] = data[key];
                }
            }
            price.updated_at = new Date();

            await transactionalEntityManager.save(InventoryPrices, price);
            return { message: messages.InventoryPrices?.price_updated ?? "Inventory price updated", data: price };
        });
    }

    /**
     * Delete an inventory price
     */
    static async delete(inv_price_id: number) {
        const price = await this.findPriceById(inv_price_id);
        if (!price) {
            throw new Error("Inventory price not found");
        }

        await InventoryPricesRepository.remove(price);
        return { message: messages.InventoryPrices?.price_deleted ?? "Inventory price deleted" };
    }

    /**
     * Set price as current for variant and type
     */
    static async setAsCurrent(inv_price_id: number) {
        return await appDataSource.transaction(async transactionalEntityManager => {
            const price = await transactionalEntityManager.findOne(InventoryPrices, {
                where: { inv_price_id }
            });

            if (!price) {
                throw new Error("Inventory price not found");
            }

            // Unset other current prices for this variant and type
            await transactionalEntityManager
                .getRepository(InventoryPrices)
                .update(
                    { 
                        inv_var_id: price.inv_var_id, 
                        typeprice_id: price.typeprice_id,
                        is_current: 1 
                    },
                    { is_current: 0 }
                );

            // Set this price as current
            price.is_current = 1;
            price.updated_at = new Date();

            await transactionalEntityManager.save(InventoryPrices, price);
            return { message: "Price set as current", data: price };
        });
    }

    /**
     * Get prices by variant ID and type
     */
    static async getPricesByVariantAndType(inv_var_id: number, typeprice_id: number) {
        return await InventoryPricesRepository
            .createQueryBuilder("prices")
            .leftJoinAndSelect("prices.inventoryVariant", "variant")
            .leftJoinAndSelect("prices.typeOfPrice", "typeOfPrice")
            .where("prices.inv_var_id = :inv_var_id", { inv_var_id })
            .andWhere("prices.typeprice_id = :typeprice_id", { typeprice_id })
            .orderBy("prices.valid_from", "DESC")
            .getMany();
    }
} 