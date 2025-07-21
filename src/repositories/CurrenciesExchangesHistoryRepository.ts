import { appDataSource } from "../app-data-source";
import { CurrenciesExchangesHistory } from "../entity/currencies_exchanges_history.entity";

export const CurrenciesExchangesHistoryRepository = appDataSource.getRepository(CurrenciesExchangesHistory); 