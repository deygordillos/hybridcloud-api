import { appDataSource } from "../app-data-source";
import { AuditLogs } from "../entity/audit_logs.entity";

export const AuditLogsRepository = appDataSource.getRepository(AuditLogs);
