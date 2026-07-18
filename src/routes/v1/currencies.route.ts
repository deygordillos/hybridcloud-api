import { Router } from 'express'
import { query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { CurrenciesController } from '../../controllers/currencies.controller';

const router = Router();

/**
 * @swagger
 * /v1/currencies:
 *   get:
 *     summary: Get currencies catalog
 *     description: Retrieves the global catalog of currencies with pagination
 *     tags: [currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *         description: Currency status (1 active, 0 inactive)
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Currencies found
 *                 recordsTotal:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currency_id:
 *                         type: integer
 *                         example: 1
 *                       currency_iso_code:
 *                         type: string
 *                         example: VES
 *                       currency_name:
 *                         type: string
 *                         example: Bolívar
 *                       currency_symbol:
 *                         type: string
 *                         example: Bs
 *                       currency_type:
 *                         type: integer
 *                         example: 1
 *                       currency_status:
 *                         type: integer
 *                         example: 1
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    [
        authMiddleware,
        query('page').optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
        query('limit').optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
        query('status').optional().isIn(['0', '1']).withMessage("status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    CurrenciesController.getCurrencies);

export default router
