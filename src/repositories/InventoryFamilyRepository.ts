import { appDataSource } from "../app-data-source";
import { InventoryFamily } from "../entity/inventoryFamily.entity";

export const InventoryFamilyRepository = appDataSource.getRepository(InventoryFamily);
