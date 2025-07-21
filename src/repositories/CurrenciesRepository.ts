import { appDataSource } from "../app-data-source";
import { Currencies } from "../entity/currencies.entity";

export const CurrenciesRepository = appDataSource.getRepository(Currencies); 