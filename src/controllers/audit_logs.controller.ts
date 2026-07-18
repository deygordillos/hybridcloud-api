import { Request, Response } from "express";
import { AuditService } from "../services/AuditService";

export class AuditLogsController {
    /**
     * List audit logs by company, filterable by entity_type and entity_id
     * @param req Request object
     * @param res Response object
     */
    static async getAuditLogs(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const entity_type = req.query.entity_type ? String(req.query.entity_type) : undefined;
            const entity_id = req.query.entity_id ? Number(req.query.entity_id) : undefined;

            const offset = (page - 1) * limit;
            const { data, total } = await AuditService.getLogs(company_id, offset, limit, entity_type, entity_id);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Audit logs found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });
        } catch (e) {
            console.error('AuditLogsController.getAuditLogs catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }
}
