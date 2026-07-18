import { Router } from 'express'
import { query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { DashboardController } from '../../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);
router.use(companyMiddleware);

/**
 * @swagger
 * /v1/dashboard/summary:
 *   get:
 *     summary: KPI summary for the company
 *     description: Invoiced sales (local/stable), orders by status, average ticket and active customers
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Summary retrieved
 */
router.get('/summary',
    [
        query('from').optional().isISO8601(),
        query('to').optional().isISO8601(),
        validatorRequestMiddleware
    ],
    DashboardController.summary);

/**
 * @swagger
 * /v1/dashboard/sales:
 *   get:
 *     summary: Invoiced sales time series
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: group_by
 *         schema: { type: string, enum: [day, week, month], default: day }
 *     responses:
 *       200:
 *         description: Series retrieved
 */
router.get('/sales',
    [
        query('from').optional().isISO8601(),
        query('to').optional().isISO8601(),
        query('group_by').optional().isIn(['day', 'week', 'month']),
        validatorRequestMiddleware
    ],
    DashboardController.sales);

/**
 * @swagger
 * /v1/dashboard/top-products:
 *   get:
 *     summary: Top selling products
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Top products retrieved
 */
router.get('/top-products',
    [
        query('from').optional().isISO8601(),
        query('to').optional().isISO8601(),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        validatorRequestMiddleware
    ],
    DashboardController.topProducts);

/**
 * @swagger
 * /v1/dashboard/low-stock:
 *   get:
 *     summary: Variants under stock threshold per storage
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema: { type: number }
 *         description: Explicit threshold; defaults to each row's configured minimum
 *     responses:
 *       200:
 *         description: Low stock rows retrieved
 */
router.get('/low-stock',
    [
        query('threshold').optional().isFloat({ min: 0 }),
        validatorRequestMiddleware
    ],
    DashboardController.lowStock);

/**
 * @swagger
 * /v1/dashboard/exchange-rate:
 *   get:
 *     summary: Exchange rate history series
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *       - in: query
 *         name: type
 *         schema: { type: integer, enum: [1, 2, 3], default: 2 }
 *     responses:
 *       200:
 *         description: Series retrieved
 */
router.get('/exchange-rate',
    [
        query('days').optional().isInt({ min: 1, max: 365 }),
        query('type').optional().isInt({ min: 1, max: 3 }),
        validatorRequestMiddleware
    ],
    DashboardController.exchangeRate);

/**
 * @swagger
 * /v1/dashboard/recent-activity:
 *   get:
 *     summary: Recent audit activity for the company
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Recent activity retrieved
 */
router.get('/recent-activity',
    [
        query('limit').optional().isInt({ min: 1, max: 50 }),
        validatorRequestMiddleware
    ],
    DashboardController.recentActivity);

export default router
