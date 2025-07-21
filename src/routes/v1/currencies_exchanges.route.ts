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
 * @route GET /api/v1/currencies-exchanges
 * @desc Get all currencies configured for the company
 * @access Private (requires authentication and company context)
 * @returns {Object} Array of currency exchanges with currency details
 * @example
 * GET /api/v1/currencies-exchanges
 * Response: {
 *   "message": "Currencies retrieved successfully",
 *   "currencies": [
 *     {
 *       "currency_exc_id": 1,
 *       "company_id": 123,
 *       "currency_id": 1,
 *       "currency_exc_rate": 1.00000000,
 *       "currency_exc_type": 1,
 *       "exchange_method": "MULTIPLY",
 *       "currency_exc_status": 1,
 *       "created_at": "2024-01-15T10:30:00.000Z",
 *       "currency": {
 *         "currency_id": 1,
 *         "currency_iso_code": "VES",
 *         "currency_name": "Bolívar",
 *         "currency_symbol": "Bs"
 *       }
 *     }
 *   ]
 * }
 */
router.get('/', CurrenciesExchangesController.getCompanyCurrencies);

/**
 * @route GET /api/v1/currencies-exchanges/:id
 * @desc Get a specific currency exchange by ID
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the currency exchange
 * @returns {Object} The currency exchange details with currency information
 * @example
 * GET /api/v1/currencies-exchanges/1
 * Response: {
 *   "message": "Currency retrieved successfully",
 *   "currency": {
 *     "currency_exc_id": 1,
 *     "company_id": 123,
 *     "currency_id": 1,
 *     "currency_exc_rate": 1.00000000,
 *     "currency_exc_type": 1,
 *     "exchange_method": "MULTIPLY",
 *     "currency_exc_status": 1,
 *     "created_at": "2024-01-15T10:30:00.000Z",
 *     "currency": {
 *       "currency_id": 1,
 *       "currency_iso_code": "VES",
 *       "currency_name": "Bolívar",
 *       "currency_symbol": "Bs"
 *     }
 *   }
 * }
 */
router.get('/:id', [
    param("id")
        .notEmpty().withMessage("Currency exchange ID is required")
        .isInt({ min: 1 }).withMessage("Currency exchange ID must be a valid integer greater than 0"),
    validatorRequestMiddleware
], CurrenciesExchangesController.getCurrencyById);

/**
 * @route POST /api/v1/currencies-exchanges
 * @desc Create a new currency exchange configuration for the company
 * @access Private (requires authentication and company context)
 * @body {Object} currencyData - The currency exchange data
 * @body {number} currencyData.currency_id - The currency ID (required, must exist in currencies table)
 * @body {number} currencyData.currency_exc_rate - The exchange rate (required, positive number, 8 decimal places)
 * @body {number} currencyData.currency_exc_type - The currency type (required, 1=local, 2=stable, 3=ref)
 * @body {number} [currencyData.exchange_method] - The exchange method (optional, 1=DIVIDE, 2=MULTIPLY, default: 2)
 * @body {number} [currencyData.currency_exc_status] - The status (optional, 0=inactive, 1=active, default: 1)
 * @returns {Object} The created currency exchange
 * @example
 * POST /api/v1/currencies-exchanges
 * Body: {
 *   "currency_id": 2,
 *   "currency_exc_rate": 35.12345678,
 *   "currency_exc_type": 2,
 *   "exchange_method": 2,
 *   "currency_exc_status": 1
 * }
 * Response: {
 *   "message": "Currency exchange created successfully",
 *   "currency": {
 *     "currency_exc_id": 2,
 *     "company_id": 123,
 *     "currency_id": 2,
 *     "currency_exc_rate": 35.12345678,
 *     "currency_exc_type": 2,
 *     "exchange_method": "MULTIPLY",
 *     "currency_exc_status": 1,
 *     "created_at": "2024-01-15T10:30:00.000Z"
 *   }
 * }
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
 * @route PUT /api/v1/currencies-exchanges/:id
 * @desc Update an existing currency exchange configuration
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the currency exchange to update
 * @body {Object} currencyData - The currency exchange data to update
 * @body {number} [currencyData.currency_id] - The currency ID (optional, must exist in currencies table)
 * @body {number} [currencyData.currency_exc_rate] - The exchange rate (optional, positive number, 8 decimal places)
 * @body {number} [currencyData.currency_exc_type] - The currency type (optional, 1=local, 2=stable, 3=ref)
 * @body {number} [currencyData.exchange_method] - The exchange method (optional, 1=DIVIDE, 2=MULTIPLY)
 * @body {number} [currencyData.currency_exc_status] - The status (optional, 0=inactive, 1=active)
 * @returns {Object} The updated currency exchange
 * @example
 * PUT /api/v1/currencies-exchanges/2
 * Body: {
 *   "currency_exc_rate": 36.50000000,
 *   "exchange_method": 1
 * }
 * Response: {
 *   "message": "Currency exchange updated successfully",
 *   "currency": {
 *     "currency_exc_id": 2,
 *     "company_id": 123,
 *     "currency_id": 2,
 *     "currency_exc_rate": 36.50000000,
 *     "currency_exc_type": 2,
 *     "exchange_method": "DIVIDE",
 *     "currency_exc_status": 1,
 *     "created_at": "2024-01-15T10:30:00.000Z"
 *   }
 * }
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
 * @route POST /api/v1/currencies-exchanges/convert
 * @desc Convert an amount between two currencies
 * @access Private (requires authentication and company context)
 * @body {Object} conversionData - The conversion data
 * @body {number} conversionData.from_currency_id - The source currency ID (required)
 * @body {number} conversionData.to_currency_id - The target currency ID (required)
 * @body {number} conversionData.amount - The amount to convert (required, positive number)
 * @returns {Object} The conversion result with original and converted amounts
 * @example
 * POST /api/v1/currencies-exchanges/convert
 * Body: {
 *   "from_currency_id": 1,
 *   "to_currency_id": 2,
 *   "amount": 100.00
 * }
 * Response: {
 *   "message": "Currency conversion completed",
 *   "conversion": {
 *     "from_currency_id": 1,
 *     "to_currency_id": 2,
 *     "original_amount": 100.00,
 *     "converted_amount": 3512.35,
 *     "exchange_rate": 35.12345,
 *     "exchange_method": "MULTIPLY"
 *   }
 * }
 */
router.post('/convert', [
    body("from_currency_id")
        .notEmpty().withMessage("from_currency_id is required")
        .isInt({ min: 1 }).withMessage("from_currency_id must be a valid integer greater than 0"),
    body("to_currency_id")
        .notEmpty().withMessage("to_currency_id is required")
        .isInt({ min: 1 }).withMessage("to_currency_id must be a valid integer greater than 0"),
    body("amount")
        .notEmpty().withMessage("amount is required")
        .isFloat({ min: 0.01 }).withMessage("amount must be a valid positive number greater than 0"),
    validatorRequestMiddleware
], CurrenciesExchangesController.convertCurrency);

/**
 * @route GET /api/v1/currencies-exchanges/history
 * @desc Get currency exchange rate history
 * @access Private (requires authentication and company context)
 * @query {number} [currency_id] - Filter by specific currency ID (optional)
 * @query {number} [page] - Page number for pagination (optional, default: 1)
 * @query {number} [limit] - Number of records per page (optional, default: 10)
 * @returns {Object} Paginated history of exchange rate changes
 * @example
 * GET /api/v1/currencies-exchanges/history?currency_id=2&page=1&limit=5
 * Response: {
 *   "totalRecords": 25,
 *   "history": [
 *     {
 *       "currency_exc_hist_id": 1,
 *       "company_id": 123,
 *       "currency_id": 2,
 *       "currency_exc_rate": 35.12345678,
 *       "currency_exc_type": 2,
 *       "exchange_method": "MULTIPLY",
 *       "created_at": "2024-01-15T10:30:00.000Z",
 *       "currency": {
 *         "currency_id": 2,
 *         "currency_iso_code": "USD",
 *         "currency_name": "Dólar",
 *         "currency_symbol": "$"
 *       }
 *     }
 *   ],
 *   "currentPage": 1,
 *   "totalPages": 5,
 *   "perPage": 5
 * }
 */
router.get('/history', CurrenciesExchangesController.getCurrencyHistory);

/**
 * @route POST /api/v1/currencies-exchanges/set-base
 * @desc Set a currency as the base currency for the company
 * @access Private (requires authentication and company context)
 * @body {Object} baseCurrencyData - The base currency data
 * @body {number} baseCurrencyData.currency_id - The currency ID to set as base (required)
 * @returns {Object} Success message
 * @example
 * POST /api/v1/currencies-exchanges/set-base
 * Body: {
 *   "currency_id": 1
 * }
 * Response: {
 *   "message": "Base currency set successfully"
 * }
 */
router.post('/set-base', [
    body("currency_id")
        .notEmpty().withMessage("currency_id is required")
        .isInt({ min: 1 }).withMessage("currency_id must be a valid integer greater than 0"),
    validatorRequestMiddleware
], CurrenciesExchangesController.setBaseCurrency);

export default router; 