import { AuditLogsRepository } from "../repositories/AuditLogsRepository";

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE' | 'STATUS_CHANGE';

export interface AuditLogParams {
    company_id: number;
    entity_type: string;
    entity_id: number;
    action_type: AuditActionType;
    /** Estado anterior del registro (solo campos relevantes). Null en CREATE. */
    before?: Record<string, any> | null;
    /** Estado posterior del registro. */
    after?: Record<string, any> | null;
    changed_by?: number | null;
    ip_address?: string | null;
}

export class AuditService {
    /**
     * Registra una entrada de auditoría genérica.
     * Calcula automáticamente el diff (solo campos modificados) entre before y after.
     * Nunca lanza: un fallo de auditoría no debe romper la operación de negocio.
     */
    static async log(params: AuditLogParams): Promise<void> {
        try {
            const { company_id, entity_type, entity_id, action_type, before, after, changed_by, ip_address } = params;

            const changes_data = AuditService.buildDiff(before ?? null, after ?? null, action_type);

            const entry = AuditLogsRepository.create({
                company_id,
                entity_type,
                entity_id,
                action_type,
                changes_data,
                changed_by: changed_by ? ({ user_id: changed_by } as any) : null,
                ip_address: ip_address ?? null,
            });
            await AuditLogsRepository.save(entry);
        } catch (e) {
            console.error('AuditService.log error (non-blocking):', e);
        }
    }

    /**
     * Devuelve { before, after } solo con los campos que cambiaron.
     * En CREATE devuelve { after } completo; en DELETE devuelve { before } completo.
     */
    static buildDiff(
        before: Record<string, any> | null,
        after: Record<string, any> | null,
        action_type: AuditActionType
    ): object | null {
        const IGNORED_FIELDS = ['created_at', 'updated_at', 'password', 'access_token', 'refresh_token', 'reset_password_token'];

        const clean = (obj: Record<string, any> | null) => {
            if (!obj) return null;
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                if (IGNORED_FIELDS.includes(key)) continue;
                if (value !== null && typeof value === 'object' && !(value instanceof Date)) continue;
                result[key] = value;
            }
            return result;
        };

        const cleanBefore = clean(before);
        const cleanAfter = clean(after);

        if (action_type === 'CREATE') return cleanAfter ? { after: cleanAfter } : null;
        if (action_type === 'DELETE') return cleanBefore ? { before: cleanBefore } : null;
        if (!cleanBefore || !cleanAfter) return cleanAfter ? { after: cleanAfter } : null;

        const changedBefore: Record<string, any> = {};
        const changedAfter: Record<string, any> = {};
        const keys = new Set([...Object.keys(cleanBefore), ...Object.keys(cleanAfter)]);

        for (const key of keys) {
            const beforeValue = cleanBefore[key];
            const afterValue = cleanAfter[key];
            if (String(beforeValue) !== String(afterValue)) {
                changedBefore[key] = beforeValue;
                changedAfter[key] = afterValue;
            }
        }

        if (Object.keys(changedAfter).length === 0) return null;
        return { before: changedBefore, after: changedAfter };
    }

    /**
     * Consulta paginada de logs de auditoría de una empresa.
     */
    static async getLogs(
        company_id: number,
        offset: number = 0,
        limit: number = 10,
        entity_type?: string,
        entity_id?: number
    ) {
        const qb = AuditLogsRepository
            .createQueryBuilder("audit")
            .leftJoinAndSelect("audit.changed_by", "changed_by")
            .select([
                "audit.audit_id",
                "audit.company_id",
                "audit.entity_type",
                "audit.entity_id",
                "audit.action_type",
                "audit.changes_data",
                "audit.ip_address",
                "audit.created_at",
                "changed_by.user_id",
                "changed_by.username",
                "changed_by.first_name",
                "changed_by.last_name",
            ])
            .where("audit.company_id = :company_id", { company_id });

        if (entity_type) qb.andWhere("audit.entity_type = :entity_type", { entity_type });
        if (entity_id) qb.andWhere("audit.entity_id = :entity_id", { entity_id });

        const [data, total] = await qb
            .orderBy("audit.created_at", "DESC")
            .addOrderBy("audit.audit_id", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { data, total };
    }
}
