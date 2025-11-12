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
 * @swagger
 * /v1/inventory/prices/variant/{variantId}:
 *   get:
 *     summary: Get all prices for a specific variant
 *     description: Retrieves all inventory prices for a specific variant with pagination
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory variant ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Inventory prices found
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
 *                       inv_price_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 123
 *                       typeprice_id:
 *                         type: integer
 *                         example: 1
 *                       is_current:
 *                         type: integer
 *                         example: 1
 *                       price_local:
 *                         type: number
 *                         example: 100.50
 *                       price_ref:
 *                         type: number
 *                         example: 95.25
 *                       price_stable:
 *                         type: number
 *                         example: 100.50
 *                       currency_id_local:
 *                         type: integer
 *                         example: 1
 *                       valid_from:
 *                         type: string
 *                         format: date
 *                         example: 2024-01-01
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: Inventory prices found
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
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
 *       403:
 *         description: Forbidden - Company context required
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
 *                   example: Company context is required
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
 * @swagger
 * /v1/inventory/prices/variant/{variantId}/current:
 *   get:
 *     summary: Get current prices for a specific variant
 *     description: Retrieves current (active) inventory prices for a specific variant
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory variant ID
 *     responses:
 *       200:
 *         description: Current inventory prices found
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
 *                 message:
 *                   type: string
 *                   example: Current inventory prices found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Variant not found
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
 * @swagger
 * /v1/inventory/prices/variant/{variantId}/type/{typeId}:
 *   get:
 *     summary: Get prices for a variant by price type
 *     description: Retrieves inventory prices for a specific variant and price type
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory variant ID
 *       - in: path
 *         name: typeId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Price type ID
 *     responses:
 *       200:
 *         description: Inventory prices found
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
 *                 message:
 *                   type: string
 *                   example: Inventory prices found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Variant or price type not found
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
 * @swagger
 * /v1/inventory/prices:
 *   post:
 *     summary: Create a new inventory price
 *     description: Creates a new inventory price with local, stable, and reference currency support
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inv_var_id
 *               - typeprice_id
 *             properties:
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory variant ID
 *                 example: 123
 *               typeprice_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Price type ID
 *                 example: 1
 *               is_current:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Whether this is the current price (0=no, 1=yes)
 *                 example: 1
 *               price_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Total price in local currency
 *                 example: 100.50
 *               price_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable price
 *                 example: 100.50
 *               price_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Total price in reference currency
 *                 example: 95.25
 *               price_base_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Base price in local currency
 *               price_base_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable base price
 *               price_base_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Base price in reference currency
 *               tax_amount_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Tax amount in local currency
 *               tax_amount_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable tax amount
 *               tax_amount_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Tax amount in reference currency
 *               cost_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Cost in local currency
 *               cost_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable cost
 *               cost_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Cost in reference currency
 *               cost_avg_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Average cost in local currency
 *               cost_avg_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable average cost
 *               cost_avg_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Average cost in reference currency
 *               profit_local:
 *                 type: number
 *                 description: Profit in local currency
 *               profit_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable profit
 *               profit_ref:
 *                 type: number
 *                 description: Profit in reference currency
 *               currency_id_local:
 *                 type: integer
 *                 minimum: 1
 *                 description: Local currency ID
 *                 example: 1
 *               currency_id_stable:
 *                 type: integer
 *                 minimum: 1
 *                 description: Stable currency ID
 *                 example: 1
 *               currency_id_ref:
 *                 type: integer
 *                 minimum: 1
 *                 description: Reference currency ID
 *                 example: 2
 *               valid_from:
 *                 type: string
 *                 format: date
 *                 description: Date from which this price is valid
 *                 example: 2024-01-01
 *     responses:
 *       201:
 *         description: Inventory price created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Inventory price created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
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
 * @swagger
 * /v1/inventory/prices/{id}:
 *   put:
 *     summary: Update an inventory price
 *     description: Updates an existing inventory price
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory price ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory variant ID
 *               typeprice_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Price type ID
 *               is_current:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Whether this is the current price
 *               price_local:
 *                 type: number
 *                 minimum: 0
 *                 description: Total price in local currency
 *               price_stable:
 *                 type: number
 *                 minimum: 0
 *                 description: Stable price
 *               price_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Total price in reference currency
 *               valid_from:
 *                 type: string
 *                 format: date
 *                 description: Date from which this price is valid
 *     responses:
 *       200:
 *         description: Inventory price updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Inventory price updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Price not found
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
 * @route DELETE /v1/inventory/prices/:id
 * @desc Delete an inventory price
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the inventory price to delete
 * @returns {Object} Success message
 * @example
 * DELETE /v1/inventory/prices/456
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
 * @swagger
 * /v1/inventory/prices/{id}/set-current:
 *   patch:
 *     summary: Set a price as current
 *     description: Sets an inventory price as the current price for its variant and type
 *     tags: [inventory-prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory price ID
 *     responses:
 *       200:
 *         description: Price set as current
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Price set as current
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Price not found
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