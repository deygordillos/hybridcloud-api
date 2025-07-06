import { appDataSource } from "../app-data-source";
import { InventoryVariantsAttrs } from "../entity/inventory_variants_attrs.entity";

export const InventoryVariantsAttrsRepository = appDataSource.getRepository(InventoryVariantsAttrs);