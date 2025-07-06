import { appDataSource } from "../app-data-source";
import { InventoryVariants } from "../entity/inventory_variants.entity";

export const InventoryVariantsRepository = appDataSource.getRepository(InventoryVariants);