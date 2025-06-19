import { appDataSource } from "../app-data-source";
import { Taxes } from "../entity/taxes.entity";

export const TaxesRepository = appDataSource.getRepository(Taxes);