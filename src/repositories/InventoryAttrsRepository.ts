import { appDataSource } from "../app-data-source";
import { InventoryAttrs } from "../entity/inventory_attrs.entity";

export const InventoryAttrsRepository = appDataSource.getRepository(InventoryAttrs);
