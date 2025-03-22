import { appDataSource } from "../app-data-source";
import { Users } from "../entity/users.entity";

export const UserRepository = appDataSource.getRepository(Users);
