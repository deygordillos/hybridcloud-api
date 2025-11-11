import { Router } from "express";
import { body, param } from "express-validator";
import { validatorRequestMiddleware } from "../../middlewares/validator_request";
import { CurrenciesExchangesController } from "../../controllers/currencies_exchanges.controller";
import { authMiddleware } from "../../middlewares/AuthMiddleware";
import { companyMiddleware } from "../../middlewares/companyMiddleware";

/**
 * Currencies Exchanges Routes
 * 
 * This module contains all the routes for managing company currencies and their exchange rates.
 * Currencies exchanges allow companies to configure multiple currencies with their respective
 * exchange rates, types (local, stable, reference), and conversion methods.
 * 
 * All routes require authentication and company context.
 * 
 * Currency Types:
 * - 1: Local (base currency for the company)
 * - 2: Stable (stable currencies like USD, EUR)
 * - 3: Reference (reference currencies for calculations)
 * 
 * Exchange Methods:
 * - 1 (DIVIDE): Amount / Exchange Rate = Converted Amount
 * - 2 (MULTIPLY): Amount * Exchange Rate = Converted Amount
 * 
 * @module currencies_exchanges.route
 */

const router = Router();

// Apply auth and company middleware to all routes
router.use(authMiddleware);
router.use(companyMiddleware);

/**
 * @swagger
 * /api/v1/currencies-exchanges:
 *   get:
 *     summary: Get all currencies configured for the company
 *     description: Retrieves all currency exchange configurations for the authenticated company
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currencies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       curr_exch_id:
 *                         type: integer
 *                         example: 1
 *                       currency_id:
 *                         type: integer
 *                         example: 1
 *                       currency_code:
 *                         type: string
 *                         example: USD
 *                       currency_name:
 *                         type: string
 *                         example: US Dollar
 *                       coin_id:
 *                         type: integer
 *                         example: 1
 *                       curr_exch_type:
 *                         type: integer
 *                         example: 2
 *                       curr_exch_rate:
 *                         type: number
 *                         example: 1.25
 *                       curr_exch_method:
 *                         type: integer
 *                         example: 1
 *                       curr_exch_status:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Currencies retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 */
router.get('/', CurrenciesExchangesController.getCompanyCurrencies);

/**
 * @swagger
 * /api/v1/currencies-exchanges/history:
 *   get:
 *     summary: Get currency exchange rate history
 *     description: Retrieves historical records of exchange rate changes with optional filtering
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currency_id
 *         schema:
 *           type: integer
 *         description: Filter by specific currency ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       curr_exch_hist_id:
 *                         type: integer
 *                         example: 1
 *                       curr_exch_id:
 *                         type: integer
 *                         example: 1
 *                       curr_exch_rate_old:
 *                         type: number
 *                         example: 1.20
 *                       curr_exch_rate_new:
 *                         type: number
 *                         example: 1.25
 *                       change_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-11T10:00:00Z"
 *                       changed_by:
 *                         type: integer
 *                         example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: History retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 */
router.get('/history', CurrenciesExchangesController.getCurrencyHistory);

/**
 * @swagger
 * /api/v1/currencies-exchanges/{id}:
 *   get:
 *     summary: Get a specific currency exchange by ID
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the currency exchange
 *     responses:
 *       200:
 *         description: Currency retrieved successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Currency exchange not found
 */
router.get('/:id', [
    param("id")
        .notEmpty().withMessage("Currency exchange ID is required")
        .isInt({ min: 1 }).withMessage("Currency exchange ID must be a valid integer greater than 0"),
    validatorRequestMiddleware
], CurrenciesExchangesController.getCurrencyById);

/**
 * @swagger
 * /api/v1/currencies-exchanges:
 *   post:
 *     summary: Create a new currency exchange configuration
 *     description: Creates a new currency exchange rate configuration for the company
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency_id
 *               - currency_exc_rate
 *               - currency_exc_type
 *             properties:
 *               currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The currency ID
 *                 example: 2
 *               currency_exc_rate:
 *                 type: number
 *                 format: double
 *                 minimum: 0.00000001
 *                 description: Exchange rate (8 decimal places)
 *                 example: 35.12345678
 *               currency_exc_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Currency type (1=local, 2=stable, 3=reference)
 *                 example: 2
 *               exchange_method:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: Exchange method (1=DIVIDE, 2=MULTIPLY)
 *                 example: 2
 *               currency_exc_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Currency exchange created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', [
    body("currency_id")
        .notEmpty().withMessage("currency_id is required")
        .isInt({ min: 1 }).withMessage("currency_id must be a valid integer greater than 0"),
    body("currency_exc_rate")
        .notEmpty().withMessage("currency_exc_rate is required")
        .isFloat({ min: 0.00000001 }).withMessage("currency_exc_rate must be a valid positive number"),
    body("currency_exc_type")
        .notEmpty().withMessage("currency_exc_type is required")
        .isInt({ min: 1, max: 3 }).withMessage("currency_exc_type must be 1 (local), 2 (stable), or 3 (ref)"),
    body("exchange_method")
        .isInt({ min: 1, max: 2 }).withMessage("exchange_method must be 1 (DIVIDE) or 2 (MULTIPLY)"),
    body("currency_exc_status")
        .optional()
        .isInt({ min: 0, max: 1 }).withMessage("currency_exc_status must be 0 or 1"),
    validatorRequestMiddleware
], CurrenciesExchangesController.create);

/**
 * @swagger
 * /api/v1/currencies-exchanges/{id}:
 *   put:
 *     summary: Update an existing currency exchange configuration
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the currency exchange
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The currency ID
 *               currency_exc_rate:
 *                 type: number
 *                 format: double
 *                 minimum: 0.00000001
 *                 description: Exchange rate
 *                 example: 36.50000000
 *               currency_exc_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Currency type (1=local, 2=stable, 3=reference)
 *               exchange_method:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: Exchange method (1=DIVIDE, 2=MULTIPLY)
 *               currency_exc_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *     responses:
 *       200:
 *         description: Currency exchange updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Currency exchange not found
 */
router.put('/:id', [
    param("id")
        .notEmpty().withMessage("Currency exchange ID is required")
        .isInt({ min: 1 }).withMessage("Currency exchange ID must be a valid integer greater than 0"),
    body("currency_id")
        .optional()
        .isInt({ min: 1 }).withMessage("currency_id must be a valid integer greater than 0"),
    body("currency_exc_rate")
        .optional()
        .isFloat({ min: 0.00000001 }).withMessage("currency_exc_rate must be a valid positive number"),
    body("currency_exc_type")
        .optional()
        .isInt({ min: 1, max: 3 }).withMessage("currency_exc_type must be 1 (local), 2 (stable), or 3 (ref)"),
    body("exchange_method")
        .optional()
        .isInt({ min: 1, max: 2 }).withMessage("exchange_method must be 1 (DIVIDE) or 2 (MULTIPLY)"),
    body("currency_exc_status")
        .optional()
        .isInt({ min: 0, max: 1 }).withMessage("currency_exc_status must be 0 or 1"),
    validatorRequestMiddleware
], CurrenciesExchangesController.update);

/**
 * @swagger
 * /api/v1/currencies-exchanges/set-base:
 *   post:
 *     summary: Set a currency as the base currency for the company
 *     description: Configures the base currency used for all currency conversions
 *     tags: [currencies-exchanges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency_id
 *             properties:
 *               currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The currency ID to set as base
 *                 example: 1
 *     responses:
 *       200:
 *         description: Base currency set successfully
 *       400:
 *         description: Invalid currency ID
 *       401:
 *         description: Unauthorized
 */
router.post('/set-base', [
    body("currency_id")
        .notEmpty().withMessage("currency_id is required")
        .isInt({ min: 1 }).withMessage("currency_id must be a valid integer greater than 0"),
    validatorRequestMiddleware
], CurrenciesExchangesController.setBaseCurrency);

export default router; 