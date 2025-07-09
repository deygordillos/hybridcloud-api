import { appDataSource } from "../app-data-source";
import { InventoryLots } from "../entity/inventory_lots.entity";

export const InventoryLotsRepository = appDataSource.getRepository(InventoryLots);