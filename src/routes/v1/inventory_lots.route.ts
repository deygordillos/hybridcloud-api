import { Router } from 'express';
import { body, param } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryLotsController } from '../../controllers/inventory_lots.controller';

/**
 * Inventory Lots Routes
 * 
 * This module contains all the routes for managing inventory lots.
 * Inventory lots are used to track specific batches or lots of inventory variants
 * with additional information like expiration dates, manufacture dates, costs, etc.
 * 
 * All routes require authentication and company context.
 * 
 * @module inventory_lots.route
 */

const router = Router();


/**
 * @route GET /api/v1/inventory/lots/variant/:variantId
 * @desc Get all inventory lots for a specific inventory variant
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @returns {Object} Array of inventory lots associated with the variant
 * @example
 * GET /api/v1/inventory/lots/variant/123
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Inventory lots retrieved successfully"
 * }
 */
router.get('/variant/:variantId',
    [
        authMiddleware,
        companyMiddleware,
        param("variantId")
            .notEmpty().withMessage("variantId is required")
            .isInt({ min: 1 }).withMessage("You must send a valid variantId")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("variantId must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.getByVariantId
);

/**
 * @route GET /api/v1/inventory/lots/search/:lotNumber
 * @desc Search inventory lots by lot number
 * @access Private (requires authentication and company context)
 * @param {string} lotNumber - The lot number to search for
 * @returns {Object} Array of inventory lots matching the lot number
 * @example
 * GET /api/v1/inventory/lots/search/LOT123
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Inventory lots retrieved successfully"
 * }
 */
router.get('/search/:lotNumber',
    [
        authMiddleware,
        companyMiddleware,
        param("lotNumber")
            .notEmpty().isString().withMessage("lotNumber is required")
            .isLength({ max: 100 }).withMessage("lotNumber must be a string (max 100 chars)"),
        validatorRequestMiddleware
    ],
    InventoryLotsController.getByLotNumber
);

/**
 * @route GET /api/v1/inventory/lots/summary/stats
 * @desc Get summary statistics for inventory lots
 * @access Private (requires authentication and company context)
 * @returns {Object} Summary statistics including total, active, inactive, expiring soon, and expired lots
 * @example
 * GET /api/v1/inventory/lots/summary/stats
 * Response: {
 *   "success": true,
 *   "data": {
 *     "totalLots": 150,
 *     "activeLots": 120,
 *     "inactiveLots": 30,
 *     "expiringSoon": 5,
 *     "expiredLots": 2
 *   },
 *   "message": "Lots summary retrieved successfully"
 * }
 */
router.get('/summary/stats',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryLotsController.getSummary
);

/**
 * @route GET /api/v1/inventory/lots/:id
 * @desc Get a specific inventory lot by ID
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory lot
 * @returns {Object} The inventory lot details
 * @example
 * GET /api/v1/inventory/lots/456
 * Response: {
 *   "success": true,
 *   "data": {
 *     "inv_lot_id": 456,
 *     "lot_number": "LOT123",
 *     "lot_status": 1,
 *     "expiration_date": "2024-12-31",
 *     ...
 *   },
 *   "message": "Inventory lot retrieved successfully"
 * }
 */
router.get('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.getById
);

/**
 * @route POST /api/v1/inventory/lots
 * @desc Create a new inventory lot
 * @access Private (requires authentication and company context)
 * @body {Object} lotData - The inventory lot data
 * @body {number} lotData.inv_var_id - The inventory variant ID (required)
 * @body {string} lotData.lot_number - The lot number (required, max 100 chars)
 * @body {string} [lotData.lot_origin] - The lot origin (optional, max 100 chars)
 * @body {number} [lotData.lot_status] - The lot status (optional, 0 or 1, default: 1)
 * @body {string} [lotData.expiration_date] - The expiration date (optional, ISO8601 format)
 * @body {string} [lotData.manufacture_date] - The manufacture date (optional, ISO8601 format)
 * @body {string} [lotData.lot_notes] - Notes about the lot (optional)
 * @body {number} [lotData.lot_unit_cost] - The unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id] - The currency ID for unit cost (optional, default: 1)
 * @body {number} [lotData.lot_unit_cost_ref] - The reference unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id_ref] - The currency ID for reference cost (optional, default: 1)
 * @returns {Object} The created inventory lot
 * @example
 * POST /api/v1/inventory/lots
 * Body: {
 *   "inv_var_id": 123,
 *   "lot_number": "LOT123",
 *   "lot_origin": "Supplier A",
 *   "expiration_date": "2024-12-31",
 *   "lot_unit_cost": 25.50,
 *   "lot_unit_currency_id": 1
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory lot created successfully"
 * }
 */
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_var_id")
            .notEmpty().withMessage("inv_var_id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid inv_var_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("inv_var_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_number")
            .notEmpty().isString().withMessage("lot_number is required")
            .isLength({ max: 100 }).withMessage("lot_number must be a string (max 100 chars)"),
        body("lot_origin")
            .optional().isString().withMessage("lot_origin must be a string")
            .isLength({ max: 100 }).withMessage("lot_origin must be a string (max 100 chars)"),
        body("lot_status")
            .optional().isInt().isIn([0, 1]).withMessage("lot_status must be 0 or 1"),
        body("expiration_date")
            .optional().isISO8601().withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional().isISO8601().withMessage("manufacture_date must be a valid date"),
        body("lot_notes")
            .optional().isString().withMessage("lot_notes must be a string"),
        body("lot_unit_cost")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_cost_ref")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost_ref must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost_ref must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id_ref")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id_ref")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id_ref must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.create
);

/**
 * @route PUT /api/v1/inventory/lots/:id
 * @desc Update an existing inventory lot (full update)
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory lot to update
 * @body {Object} lotData - The inventory lot data to update
 * @body {number} [lotData.inv_var_id] - The inventory variant ID (optional)
 * @body {string} [lotData.lot_number] - The lot number (optional, max 100 chars)
 * @body {string} [lotData.lot_origin] - The lot origin (optional, max 100 chars)
 * @body {number} [lotData.lot_status] - The lot status (optional, 0 or 1)
 * @body {string} [lotData.expiration_date] - The expiration date (optional, ISO8601 format)
 * @body {string} [lotData.manufacture_date] - The manufacture date (optional, ISO8601 format)
 * @body {string} [lotData.lot_notes] - Notes about the lot (optional)
 * @body {number} [lotData.lot_unit_cost] - The unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id] - The currency ID for unit cost (optional)
 * @body {number} [lotData.lot_unit_cost_ref] - The reference unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id_ref] - The currency ID for reference cost (optional)
 * @returns {Object} The updated inventory lot
 * @example
 * PUT /api/v1/inventory/lots/456
 * Body: {
 *   "lot_status": 0,
 *   "lot_notes": "Updated notes"
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory lot updated successfully"
 * }
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id must be a number, not a string");
                }
                return true;
            }),
        body("inv_var_id")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid inv_var_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("inv_var_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_number")
            .optional().isString().withMessage("lot_number must be a string")
            .isLength({ max: 100 }).withMessage("lot_number must be a string (max 100 chars)"),
        body("lot_origin")
            .optional().isString().withMessage("lot_origin must be a string")
            .isLength({ max: 100 }).withMessage("lot_origin must be a string (max 100 chars)"),
        body("lot_status")
            .optional().isInt().isIn([0, 1]).withMessage("lot_status must be 0 or 1"),
        body("expiration_date")
            .optional().isISO8601().withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional().isISO8601().withMessage("manufacture_date must be a valid date"),
        body("lot_notes")
            .optional().isString().withMessage("lot_notes must be a string"),
        body("lot_unit_cost")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_cost_ref")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost_ref must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost_ref must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id_ref")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id_ref")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id_ref must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.update
);

/**
 * @route PATCH /api/v1/inventory/lots/:id
 * @desc Update an existing inventory lot (partial update)
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory lot to update
 * @body {Object} lotData - The inventory lot data to update (partial)
 * @body {number} [lotData.inv_var_id] - The inventory variant ID (optional)
 * @body {string} [lotData.lot_number] - The lot number (optional, max 100 chars)
 * @body {string} [lotData.lot_origin] - The lot origin (optional, max 100 chars)
 * @body {number} [lotData.lot_status] - The lot status (optional, 0 or 1)
 * @body {string} [lotData.expiration_date] - The expiration date (optional, ISO8601 format)
 * @body {string} [lotData.manufacture_date] - The manufacture date (optional, ISO8601 format)
 * @body {string} [lotData.lot_notes] - Notes about the lot (optional)
 * @body {number} [lotData.lot_unit_cost] - The unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id] - The currency ID for unit cost (optional)
 * @body {number} [lotData.lot_unit_cost_ref] - The reference unit cost (optional, positive number)
 * @body {number} [lotData.lot_unit_currency_id_ref] - The currency ID for reference cost (optional)
 * @returns {Object} The updated inventory lot
 * @example
 * PATCH /api/v1/inventory/lots/456
 * Body: {
 *   "lot_status": 0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory lot updated successfully"
 * }
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id"),
        body("inv_var_id")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid inv_var_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("inv_var_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_number")
            .optional().isString().withMessage("lot_number must be a string")
            .isLength({ max: 100 }).withMessage("lot_number must be a string (max 100 chars)"),
        body("lot_origin")
            .optional().isString().withMessage("lot_origin must be a string")
            .isLength({ max: 100 }).withMessage("lot_origin must be a string (max 100 chars)"),
        body("lot_status")
            .optional().isInt().isIn([0, 1]).withMessage("lot_status must be 0 or 1"),
        body("expiration_date")
            .optional().isISO8601().withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional().isISO8601().withMessage("manufacture_date must be a valid date"),
        body("lot_notes")
            .optional().isString().withMessage("lot_notes must be a string"),
        body("lot_unit_cost")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_cost_ref")
            .optional()
            .isFloat({ min: 0 }).withMessage("lot_unit_cost_ref must be a positive number")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_cost_ref must be a number, not a string");
                }
                return true;
            }),
        body("lot_unit_currency_id_ref")
            .optional()
            .isInt({ min: 1 }).withMessage("You must send a valid lot_unit_currency_id_ref")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("lot_unit_currency_id_ref must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.update
);

/**
 * @route PATCH /api/v1/inventory/lots/:id/deactivate
 * @desc Deactivate an inventory lot (set status to 0)
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory lot to deactivate
 * @returns {Object} Success message
 * @example
 * PATCH /api/v1/inventory/lots/456/deactivate
 * Response: {
 *   "success": true,
 *   "message": "Inventory lot deactivated successfully"
 * }
 */
router.patch('/:id/deactivate',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.deactivate
);

/**
 * @route PATCH /api/v1/inventory/lots/:id/activate
 * @desc Activate an inventory lot (set status to 1)
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory lot to activate
 * @returns {Object} Success message
 * @example
 * PATCH /api/v1/inventory/lots/456/activate
 * Response: {
 *   "success": true,
 *   "message": "Inventory lot activated successfully"
 * }
 */
router.patch('/:id/activate',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryLotsController.activate
);

/**
 * Validation Rules Summary:
 * 
 * Required Fields:
 * - inv_var_id: Must be a positive integer
 * - lot_number: Must be a non-empty string (max 100 chars)
 * 
 * Optional Fields:
 * - lot_origin: String (max 100 chars)
 * - lot_status: Integer (0 or 1)
 * - expiration_date: ISO8601 date format
 * - manufacture_date: ISO8601 date format
 * - lot_notes: String
 * - lot_unit_cost: Positive float
 * - lot_unit_currency_id: Positive integer
 * - lot_unit_cost_ref: Positive float
 * - lot_unit_currency_id_ref: Positive integer
 * 
 * Business Rules:
 * - All numeric IDs must be positive integers
 * - All costs must be positive numbers
 * - Dates must be in ISO8601 format
 * - Status values must be 0 (inactive) or 1 (active)
 * - String fields have maximum length restrictions
 * 
 * Error Responses:
 * - 400: Validation errors or invalid data
 * - 401: Unauthorized (missing or invalid token)
 * - 403: Forbidden (insufficient permissions)
 * - 404: Resource not found
 * - 500: Internal server error
 */

export default router; 