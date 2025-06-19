import { appDataSource } from "../app-data-source";
import { InventoryStorage } from "../entity/inventoryStorage.entity";

export const InventoryStorageRepository = appDataSource.getRepository(InventoryStorage);
