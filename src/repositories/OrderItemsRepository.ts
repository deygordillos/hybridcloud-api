import { appDataSource } from "../app-data-source";
import { OrderItems } from "../entity/order_items.entity";

export const OrderItemsRepository = appDataSource.getRepository(OrderItems);
