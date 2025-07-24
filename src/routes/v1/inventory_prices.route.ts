import { Router } from 'express';
import { body, param } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryPricesController } from '../../controllers/inventory_prices.controller';

/**
 * Inventory Prices Routes
 * 
 * This module contains all the routes for managing inventory prices.
 * Inventory prices track different pricing information for inventory variants
 * including local and reference currency prices, costs, taxes, and profit margins.
 * 
 * All routes require authentication and company context.
 * 
 * @module inventory_prices.route
 */

const router = Router();

/**
 * @route GET /api/v1/inventory/prices/variant/:variantId
 * @desc Get all inventory prices for a specific inventory variant with pagination
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page
 * @returns {Object} Paginated array of inventory prices associated with the variant
 * @example
 * GET /api/v1/inventory/prices/variant/123?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Inventory prices found",
 *   "pagination": {
 *     "total": 25,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 3
 *   }
 * }
 */
router.get('/variant/:variantId',
    [
        authMiddleware,
        companyMiddleware,
        param("variantId")
            .notEmpty().withMessage("variantId is required")
            .isInt({ min: 1 }).withMessage("You must send a valid variantId"),
        validatorRequestMiddleware
    ],
    InventoryPricesController.getPricesByVariantId
);

/**
 * @route GET /api/v1/inventory/prices/variant/:variantId/current
 * @desc Get current (active) inventory prices for a specific inventory variant
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @returns {Object} Array of current inventory prices associated with the variant
 * @example
 * GET /api/v1/inventory/prices/variant/123/current
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Current inventory prices found"
 * }
 */
router.get('/variant/:variantId/current',
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
    InventoryPricesController.getCurrentPricesByVariantId
);

/**
 * @route GET /api/v1/inventory/prices/variant/:variantId/type/:typeId
 * @desc Get inventory prices for a specific variant and price type
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @param {number} typeId - The ID of the price type
 * @returns {Object} Array of inventory prices for the specific variant and type
 * @example
 * GET /api/v1/inventory/prices/variant/123/type/1
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Inventory prices found"
 * }
 */
router.get('/variant/:variantId/type/:typeId',
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
        param("typeId")
            .notEmpty().withMessage("typeId is required")
            .isInt({ min: 1 }).withMessage("You must send a valid typeId")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("typeId must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryPricesController.getPricesByVariantAndType
);

/**
 * @route POST /api/v1/inventory/prices
 * @desc Create a new inventory price
 * @access Private (requires authentication and company context)
 * @body {Object} priceData - The inventory price data
 * @body {number} priceData.inv_var_id - The inventory variant ID (required)
 * @body {number} priceData.typeprice_id - The price type ID (required)
 * @body {number} [priceData.is_current] - Whether this is the current price (optional, 0 or 1)
 * @body {number} [priceData.price_local] - Total price in local currency (optional, positive number)
 * @body {number} [priceData.price_stable] - Stable price (optional, positive number)
 * @body {number} [priceData.price_ref] - Total price in reference currency (optional, positive number)
 * @body {number} [priceData.price_base_local] - Base price in local currency (optional, positive number)
 * @body {number} [priceData.price_base_stable] - Stable base price (optional, positive number)
 * @body {number} [priceData.price_base_ref] - Base price in reference currency (optional, positive number)
 * @body {number} [priceData.tax_amount_local] - Tax amount in local currency (optional, positive number)
 * @body {number} [priceData.tax_amount_stable] - Stable tax amount (optional, positive number)
 * @body {number} [priceData.tax_amount_ref] - Tax amount in reference currency (optional, positive number)
 * @body {number} [priceData.cost_local] - Cost in local currency (optional, positive number)
 * @body {number} [priceData.cost_stable] - Stable cost (optional, positive number)
 * @body {number} [priceData.cost_ref] - Cost in reference currency (optional, positive number)
 * @body {number} [priceData.cost_avg_local] - Average cost in local currency (optional, positive number)
 * @body {number} [priceData.cost_avg_stable] - Stable average cost (optional, positive number)
 * @body {number} [priceData.cost_avg_ref] - Average cost in reference currency (optional, positive number)
 * @body {number} [priceData.profit_local] - Profit in local currency (optional)
 * @body {number} [priceData.profit_stable] - Stable profit (optional, positive number)
 * @body {number} [priceData.profit_ref] - Profit in reference currency (optional)
 * @body {number} [priceData.currency_id_local] - Local currency ID (optional, default: 1)
 * @body {number} [priceData.currency_id_stable] - Stable currency ID (optional, default: 1)
 * @body {number} [priceData.currency_id_ref] - Reference currency ID (optional, default: 1)
 * @body {string} [priceData.valid_from] - Date from which this price is valid (optional, ISO8601 format)
 * @returns {Object} The created inventory price
 * @example
 * POST /api/v1/inventory/prices
 * Body: {
 *   "inv_var_id": 123,
 *   "typeprice_id": 1,
 *   "is_current": 1,
 *   "price_local": 100.50,
 *   "price_ref": 95.25,
 *   "currency_id_local": 1,
 *   "currency_id_ref": 2,
 *   "currency_id_stable": 3,
 *   "valid_from": "2024-01-01",
 *   "price_stable": 100.50,
 *   "price_base_stable": 95.25,
 *   "tax_amount_stable": 0.00,
 *   "cost_stable": 0.00,
 *   "cost_avg_stable": 0.00,
 *   "profit_stable": 0.00
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory price created"
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
        body("typeprice_id")
            .notEmpty().withMessage("typeprice_id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid typeprice_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("typeprice_id must be a number, not a string");
                }
                return true;
            }),
        body("is_current")
            .optional().isInt().isIn([0, 1]).withMessage("is_current must be 0 or 1"),
        body("price_local")
            .optional().isFloat({ min: 0 }).withMessage("price_local must be a positive number"),
        body("price_ref")
            .optional().isFloat({ min: 0 }).withMessage("price_ref must be a positive number"),
        body("price_base_local")
            .optional().isFloat({ min: 0 }).withMessage("price_base_local must be a positive number"),
        body("price_base_ref")
            .optional().isFloat({ min: 0 }).withMessage("price_base_ref must be a positive number"),
        body("tax_amount_local")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_local must be a positive number"),
        body("tax_amount_ref")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_ref must be a positive number"),
        body("cost_local")
            .optional().isFloat({ min: 0 }).withMessage("cost_local must be a positive number"),
        body("cost_ref")
            .optional().isFloat({ min: 0 }).withMessage("cost_ref must be a positive number"),
        body("cost_avg_local")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_local must be a positive number"),
        body("cost_avg_ref")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_ref must be a positive number"),
        body("profit_local")
            .optional().isFloat().withMessage("profit_local must be a number"),
        body("profit_ref")
            .optional().isFloat().withMessage("profit_ref must be a number"),
        body("currency_id_local")
            .optional().isInt({ min: 1 }).withMessage("currency_id_local must be a positive integer"),
        body("currency_id_ref")
            .optional().isInt({ min: 1 }).withMessage("currency_id_ref must be a positive integer"),
        body("currency_id_stable")
            .optional().isInt({ min: 1 }).withMessage("currency_id_stable must be a positive integer"),
        body("valid_from")
            .optional().isISO8601().withMessage("valid_from must be a valid date"),
        body("price_stable")
            .optional().isFloat({ min: 0 }).withMessage("price_stable must be a positive number"),
        body("price_base_stable")
            .optional().isFloat({ min: 0 }).withMessage("price_base_stable must be a positive number"),
        body("tax_amount_stable")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_stable must be a positive number"),
        body("cost_stable")
            .optional().isFloat({ min: 0 }).withMessage("cost_stable must be a positive number"),
        body("cost_avg_stable")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_stable must be a positive number"),
        body("profit_stable")
            .optional().isFloat().withMessage("profit_stable must be a number"),
        validatorRequestMiddleware
    ],
    InventoryPricesController.create
);

/**
 * @route PUT /api/v1/inventory/prices/:id
 * @desc Update an existing inventory price
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory price to update
 * @body {Object} priceData - The inventory price data to update
 * @body {number} [priceData.inv_var_id] - The inventory variant ID (optional)
 * @body {number} [priceData.typeprice_id] - The price type ID (optional)
 * @body {number} [priceData.is_current] - Whether this is the current price (optional, 0 or 1)
 * @body {number} [priceData.price_local] - Total price in local currency (optional, positive number)
 * @body {number} [priceData.price_ref] - Total price in reference currency (optional, positive number)
 * @body {number} [priceData.price_base_local] - Base price in local currency (optional, positive number)
 * @body {number} [priceData.price_base_ref] - Base price in reference currency (optional, positive number)
 * @body {number} [priceData.tax_amount_local] - Tax amount in local currency (optional, positive number)
 * @body {number} [priceData.tax_amount_ref] - Tax amount in reference currency (optional, positive number)
 * @body {number} [priceData.cost_local] - Cost in local currency (optional, positive number)
 * @body {number} [priceData.cost_ref] - Cost in reference currency (optional, positive number)
 * @body {number} [priceData.cost_avg_local] - Average cost in local currency (optional, positive number)
 * @body {number} [priceData.cost_avg_ref] - Average cost in reference currency (optional, positive number)
 * @body {number} [priceData.profit_local] - Profit in local currency (optional)
 * @body {number} [priceData.profit_ref] - Profit in reference currency (optional)
 * @body {number} [priceData.currency_id_local] - Local currency ID (optional)
 * @body {number} [priceData.currency_id_ref] - Reference currency ID (optional)
 * @body {number} [priceData.currency_id_stable] - Stable currency ID (optional)
 * @body {string} [priceData.valid_from] - Date from which this price is valid (optional, ISO8601 format)
 * @body {number} [priceData.price_stable] - Stable price (optional, positive number)
 * @body {number} [priceData.price_base_stable] - Stable base price (optional, positive number)
 * @body {number} [priceData.tax_amount_stable] - Stable tax amount (optional, positive number)
 * @body {number} [priceData.cost_stable] - Stable cost (optional, positive number)
 * @body {number} [priceData.cost_avg_stable] - Stable average cost (optional, positive number)
 * @body {number} [priceData.profit_stable] - Stable profit (optional, positive number)
 * @returns {Object} The updated inventory price
 * @example
 * PUT /api/v1/inventory/prices/456
 * Body: {
 *   "price_local": 110.75,
 *   "price_ref": 105.50,
 *   "is_current": 1,
 *   "price_stable": 100.50,
 *   "price_base_stable": 95.25,
 *   "tax_amount_stable": 0.00,
 *   "cost_stable": 0.00,
 *   "cost_avg_stable": 0.00,
 *   "profit_stable": 0.00
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory price updated"
 * }
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_var_id")
            .optional().isInt({ min: 1 }).withMessage("You must send a valid inv_var_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("inv_var_id must be a number, not a string");
                }
                return true;
            }),
        body("typeprice_id")
            .optional().isInt({ min: 1 }).withMessage("You must send a valid typeprice_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("typeprice_id must be a number, not a string");
                }
                return true;
            }),
        body("is_current")
            .optional().isInt().isIn([0, 1]).withMessage("is_current must be 0 or 1"),
        body("price_local")
            .optional().isFloat({ min: 0 }).withMessage("price_local must be a positive number"),
        body("price_ref")
            .optional().isFloat({ min: 0 }).withMessage("price_ref must be a positive number"),
        body("price_base_local")
            .optional().isFloat({ min: 0 }).withMessage("price_base_local must be a positive number"),
        body("price_base_ref")
            .optional().isFloat({ min: 0 }).withMessage("price_base_ref must be a positive number"),
        body("tax_amount_local")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_local must be a positive number"),
        body("tax_amount_ref")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_ref must be a positive number"),
        body("cost_local")
            .optional().isFloat({ min: 0 }).withMessage("cost_local must be a positive number"),
        body("cost_ref")
            .optional().isFloat({ min: 0 }).withMessage("cost_ref must be a positive number"),
        body("cost_avg_local")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_local must be a positive number"),
        body("cost_avg_ref")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_ref must be a positive number"),
        body("profit_local")
            .optional().isFloat().withMessage("profit_local must be a number"),
        body("profit_ref")
            .optional().isFloat().withMessage("profit_ref must be a number"),
        body("currency_id_local")
            .optional().isInt({ min: 1 }).withMessage("currency_id_local must be a positive integer"),
        body("currency_id_ref")
            .optional().isInt({ min: 1 }).withMessage("currency_id_ref must be a positive integer"),
        body("currency_id_stable")
            .optional().isInt({ min: 1 }).withMessage("currency_id_stable must be a positive integer"),
        body("valid_from")
            .optional().isISO8601().withMessage("valid_from must be a valid date"),
        body("price_stable")
            .optional().isFloat({ min: 0 }).withMessage("price_stable must be a positive number"),
        body("price_base_stable")
            .optional().isFloat({ min: 0 }).withMessage("price_base_stable must be a positive number"),
        body("tax_amount_stable")
            .optional().isFloat({ min: 0 }).withMessage("tax_amount_stable must be a positive number"),
        body("cost_stable")
            .optional().isFloat({ min: 0 }).withMessage("cost_stable must be a positive number"),
        body("cost_avg_stable")
            .optional().isFloat({ min: 0 }).withMessage("cost_avg_stable must be a positive number"),
        body("profit_stable")
            .optional().isFloat().withMessage("profit_stable must be a number"),
        validatorRequestMiddleware
    ],
    InventoryPricesController.update
);

/**
 * @route DELETE /api/v1/inventory/prices/:id
 * @desc Delete an inventory price
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory price to delete
 * @returns {Object} Success message
 * @example
 * DELETE /api/v1/inventory/prices/456
 * Response: {
 *   "success": true,
 *   "message": "Inventory price deleted"
 * }
 */
// router.delete('/:id',
//     [
//         authMiddleware,
//         companyMiddleware,
//         param("id")
//             .notEmpty().withMessage("id is required")
//             .isInt({ min: 1 }).withMessage("You must send a valid id")
//             .custom((value) => {
//                 if (typeof value === 'string') {
//                     throw new Error("id must be a number, not a string");
//                 }
//                 return true;
//             }),
//         validatorRequestMiddleware
//     ],
//     InventoryPricesController.delete
// );

/**
 * @route PATCH /api/v1/inventory/prices/:id/set-current
 * @desc Set an inventory price as the current price for its variant and type
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory price to set as current
 * @returns {Object} The updated inventory price with current status
 * @example
 * PATCH /api/v1/inventory/prices/456/set-current
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Price set as current"
 * }
 */
router.patch('/:id/set-current',
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
    InventoryPricesController.setAsCurrent
);

export default router; 