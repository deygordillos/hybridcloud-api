import { appDataSource } from "../app-data-source";
import { InventoryPrices } from "../entity/inventory_prices.entity";

export const InventoryPricesRepository = appDataSource.getRepository(InventoryPrices);