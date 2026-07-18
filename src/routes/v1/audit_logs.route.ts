import { Router } from 'express'
import { query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { AuditLogsController } from '../../controllers/audit_logs.controller';

const router = Router();

/**
 * @swagger
 * /v1/audit-logs:
 *   get:
 *     summary: Get audit logs for the company
 *     description: Retrieves the audit trail of the company, filterable by entity. Admin only.
 *     tags: [audit-logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *           example: taxes
 *         description: Filter by entity type (taxes, customers, orders, inventory_prices, currencies_exchanges)
 *       - in: query
 *         name: entity_id
 *         schema:
 *           type: integer
 *         description: Filter by entity ID
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */
router.get('/',
    [
        authMiddleware,
        adminMiddleware,
        companyMiddleware,
        query('page').optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
        query('limit').optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
        query('entity_type').optional().isString().trim(),
        query('entity_id').optional().isInt({ min: 1 }).withMessage("entity_id must be a positive integer"),
        validatorRequestMiddleware
    ],
    AuditLogsController.getAuditLogs);

export default router
