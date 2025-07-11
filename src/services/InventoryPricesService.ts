import { InventoryPrices } from "../entity/inventory_prices.entity";
import { InventoryPricesRepository } from "../repositories/InventoryPricesRepository";
import messages from "../config/messages";
import { appDataSource } from "../app-data-source";
import { InventoryPricesHistoryRepository } from "../repositories/InventoryPricesHistoryRepository";

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
    static async create(priceData: Partial<InventoryPrices>, user_id?: number) {
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
            priceData.user_id = user_id;
            const newPrice = transactionalEntityManager.create(InventoryPrices, priceData);
            const savedPrice = await transactionalEntityManager.save(InventoryPrices, newPrice);

            // Record in history if user is provided
            if (user_id) await InventoryPricesService.recordPriceChange(savedPrice, user_id);

            return savedPrice;
        });
    }

    /**
     * Update an inventory price
     */
    static async update(
        price: InventoryPrices,
        data: Partial<Omit<InventoryPrices, "inv_price_id" | "created_at" | "updated_at">>,
        user_id?: number
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

            const updatedPrice = await transactionalEntityManager.save(InventoryPrices, price);

            // Record in history if user is provided
            if (user_id) await InventoryPricesService.recordPriceChange(updatedPrice, user_id);

            return { message: messages.InventoryPrices?.price_updated ?? "Inventory price updated", data: updatedPrice };
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
    static async setAsCurrent(inv_price_id: number, user_id?: number) {
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

            const updatedPrice = await transactionalEntityManager.save(InventoryPrices, price);

            // Record in history if user is provided
            if (user_id) {
                await InventoryPricesService.recordPriceChange(updatedPrice, user_id);
            }

            return { message: "Price set as current", data: updatedPrice };
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

    /**
     * Record a price change in history
     */
    static async recordPriceChange(price: InventoryPrices, user_id: number) {
        const historyEntry = InventoryPricesHistoryRepository.create({
            inv_var_id: price.inv_var_id,
            typeprice_id: price.typeprice_id,
            is_current: price.is_current,
            price_local: price.price_local,
            price_ref: price.price_ref,
            price_base_local: price.price_base_local,
            price_base_ref: price.price_base_ref,
            tax_amount_local: price.tax_amount_local,
            tax_amount_ref: price.tax_amount_ref,
            cost_local: price.cost_local,
            cost_ref: price.cost_ref,
            cost_avg_local: price.cost_avg_local,
            cost_avg_ref: price.cost_avg_ref,
            profit_local: price.profit_local,
            profit_ref: price.profit_ref,
            currency_id_local: price.currency_id_local,
            currency_id_ref: price.currency_id_ref,
            valid_from: price.valid_from,
            user_id
        });

        return await InventoryPricesHistoryRepository.save(historyEntry);
    }
} 