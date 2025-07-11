import { appDataSource } from "../app-data-source";
import { InventoryPricesHistory } from "../entity/inventory_prices_history.entity";

export const InventoryPricesHistoryRepository = appDataSource.getRepository(InventoryPricesHistory); 