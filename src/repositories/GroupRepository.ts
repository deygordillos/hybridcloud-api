import { appDataSource } from "../app-data-source";
import { Groups } from "../entity/groups.entity";

export const GroupRepository = appDataSource.getRepository(Groups);
