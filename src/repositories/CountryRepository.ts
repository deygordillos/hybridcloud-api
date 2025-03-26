import { appDataSource } from "../app-data-source";
import { Countries } from "../entity/countries.entity";

export const CountryRepository = appDataSource.getRepository(Countries);
