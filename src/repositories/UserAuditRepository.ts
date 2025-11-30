import { appDataSource } from "../app-data-source";
import { UsersAudit } from "../entity/users_audit.entity";

export const UserAuditRepository = appDataSource.getRepository(UsersAudit);
