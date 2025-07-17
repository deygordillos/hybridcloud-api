import { appDataSource } from "../app-data-source";
import { InventoryLotsStorages } from "../entity/inventory_lots_storages.entity";

export const InventoryLotsStoragesRepository = appDataSource.getRepository(InventoryLotsStorages); 