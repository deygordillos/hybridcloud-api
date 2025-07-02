import { appDataSource } from "../app-data-source";
import { TypesOfPrices } from "../entity/types_of_prices.entity";

export const TypesOfPricesRepository = appDataSource.getRepository(TypesOfPrices);