import { appDataSource } from "../app-data-source";
import { UsersCompanies } from "../entity/users_companies.entity";

export const UsersCompaniesRepository = appDataSource.getRepository(UsersCompanies);
