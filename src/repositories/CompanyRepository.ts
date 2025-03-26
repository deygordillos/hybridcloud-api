import { appDataSource } from "../app-data-source";
import { Companies } from "../entity/companies.entity";

export const CompanyRepository = appDataSource.getRepository(Companies);
