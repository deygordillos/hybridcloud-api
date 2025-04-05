import { appDataSource } from "../app-data-source";
import { Customers } from "../entity/customers.entity";

export const CustomerRepository = appDataSource.getRepository(Customers);
