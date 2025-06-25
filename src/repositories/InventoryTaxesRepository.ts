import { appDataSource } from "../app-data-source";
import { InventoryTaxes } from "../entity/inventory_taxes";

export const InventoryTaxesRepository = appDataSource.getRepository(InventoryTaxes);