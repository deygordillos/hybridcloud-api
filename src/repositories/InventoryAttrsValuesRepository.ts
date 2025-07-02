import { appDataSource } from "../app-data-source";
import { InventoryAttrsValues } from "../entity/inventory_attrs_values.entity";

export const InventoryAttrsValuesRepository = appDataSource.getRepository(InventoryAttrsValues);
