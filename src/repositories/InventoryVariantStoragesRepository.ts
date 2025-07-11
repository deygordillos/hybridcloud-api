import { appDataSource } from "../app-data-source";
import { InventoryVariantStorages } from "../entity/inventory_variant_storages.entity";

export const InventoryVariantStoragesRepository = appDataSource.getRepository(InventoryVariantStorages); 