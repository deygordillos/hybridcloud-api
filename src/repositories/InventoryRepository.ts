import { appDataSource } from "../app-data-source";
import { Inventory } from "../entity/inventory.entity";

export const InventoryRepository = appDataSource.getRepository(Inventory);