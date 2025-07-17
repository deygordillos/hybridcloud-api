import { InventoryMovements } from "../entity/inventory_movements.entity";
import { appDataSource } from "../app-data-source";

export const InventoryMovementsRepository = appDataSource.getRepository(InventoryMovements); 