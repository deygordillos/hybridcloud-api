import { appDataSource } from "../app-data-source";
import { CurrenciesExchanges } from "../entity/currencies_exchanges.entity";

export const CurrenciesExchangesRepository = appDataSource.getRepository(CurrenciesExchanges); 