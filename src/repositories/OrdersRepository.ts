import { appDataSource } from "../app-data-source";
import { Orders } from "../entity/orders.entity";

export const OrdersRepository = appDataSource.getRepository(Orders);
