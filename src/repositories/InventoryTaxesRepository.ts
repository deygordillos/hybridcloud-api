import { appDataSource } from "../app-data-source";
import { InventoryTaxes } from "../entity/inventory_taxes.entity";

export const InventoryTaxesRepository = appDataSource.getRepository(InventoryTaxes);