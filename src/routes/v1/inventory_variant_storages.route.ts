import { Router } from "express";
import { InventoryVariantStoragesController } from "../../controllers/inventory_variant_storages.controller";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { body, param, query } from "express-validator";

/**
 * Inventory Variant Storages Routes
 * 
 * This module contains all the routes for managing inventory variant storages.
 * Inventory variant storages track stock levels for inventory variants at specific storage locations.
 * This includes current stock, reserved stock, committed stock, previous stock, and minimum stock levels.
 * 
 * All routes require authentication and company context.
 * 
 * @module inventory_variant_storages.route
 */

const router = Router();

/**
 * @swagger
 * /api/v1/inventory/variant-storages/variant/{variantId}:
 *   get:
 *     summary: Get all variant storages for a specific variant
 *     description: Retrieves all storage locations for a specific inventory variant with pagination
 *     tags: [Inventory Variant Storages]
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
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Variant storages found
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
 *                       inv_var_sto_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_sto_id:
 *                         type: integer
 *                         example: 2
 *                       var_sto_current_stock:
 *                         type: number
 *                         example: 500
 *                       var_sto_reserved_stock:
 *                         type: number
 *                         example: 50
 *                       var_sto_committed_stock:
 *                         type: number
 *                         example: 100
 *                       var_sto_previous_stock:
 *                         type: number
 *                         example: 450
 *                       var_sto_minimum_stock:
 *                         type: number
 *                         example: 100
 *                       storage_name:
 *                         type: string
 *                         example: "Main Warehouse"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 2
 *                 message:
 *                   type: string
 *                   example: Variant storages found
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
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: variantId
 *                       message:
 *                         type: string
 *                         example: Variant ID must be a positive integer
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
router.get(
    "/variant/:variantId",
    [
        authMiddleware,
        companyMiddleware,
        param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.getStoragesByVariantId
);

/**
 * @swagger
 * /api/v1/inventory/variant-storages/variant/{variantId}/storage/{storageId}:
 *   get:
 *     summary: Get a specific variant storage
 *     description: Retrieves a specific variant storage by variant ID and storage ID
 *     tags: [Inventory Variant Storages]
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
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Storage location ID
 *     responses:
 *       200:
 *         description: Variant storage found
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
 *                   example: Variant storage found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Variant storage not found
 */
router.get(
    "/variant/:variantId/storage/:storageId",
    [
        authMiddleware,
        companyMiddleware,
        param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.getStorageByVariantAndStorage
);

/**
 * @swagger
 * /api/v1/inventory/variant-storages/variant/{variantId}/stock-summary:
 *   get:
 *     summary: Get stock summary for a variant
 *     description: Retrieves stock summary statistics across all storage locations for a variant
 *     tags: [Inventory Variant Storages]
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
 *         description: Stock summary found
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
 *                   properties:
 *                     total_stock:
 *                       type: number
 *                       example: 500.5
 *                     total_reserved:
 *                       type: number
 *                       example: 50.0
 *                     total_committed:
 *                       type: number
 *                       example: 25.0
 *                     total_prev:
 *                       type: number
 *                       example: 450.0
 *                     total_min:
 *                       type: number
 *                       example: 100.0
 *                     storage_locations:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: Stock summary found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 */
router.get(
    "/variant/:variantId/stock-summary",
    [
        authMiddleware,
        companyMiddleware,
        param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.getStockSummaryByVariantId
);

/**
 * @swagger
 * /api/v1/inventory/variant-storages/location/{storageId}:
 *   get:
 *     summary: Get all variant storages for a location
 *     description: Retrieves all inventory variants at a specific storage location with pagination
 *     tags: [Inventory Variant Storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Storage location ID
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
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Location storages found
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
 *                 pagination:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Location storages found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 */
router.get(
    "/location/:storageId",
    [
        authMiddleware,
        companyMiddleware,
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.getStoragesByLocationId
);

/**
 * @swagger
 * /api/v1/inventory/variant-storages:
 *   post:
 *     summary: Create a new variant storage
 *     description: Creates a new variant storage entry for a specific variant and storage location
 *     tags: [Inventory Variant Storages]
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
 *               - id_inv_storage
 *               - inv_vs_stock
 *             properties:
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory variant ID
 *                 example: 123
 *               id_inv_storage:
 *                 type: integer
 *                 minimum: 1
 *                 description: Storage location ID
 *                 example: 456
 *               inv_vs_stock:
 *                 type: number
 *                 description: Current stock level
 *                 example: 100.5
 *               inv_vs_stock_reserved:
 *                 type: number
 *                 description: Reserved stock level
 *                 example: 10.0
 *               inv_vs_stock_committed:
 *                 type: number
 *                 description: Committed stock level
 *               inv_vs_stock_prev:
 *                 type: number
 *                 description: Previous stock level
 *               inv_vs_stock_min:
 *                 type: number
 *                 description: Minimum stock level
 *                 example: 20.0
 *     responses:
 *       201:
 *         description: Variant storage created
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
 *                   example: Variant storage created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 */
router.post(
    "/",
    [
        authMiddleware,
        companyMiddleware,
        body("inv_var_id").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("id_inv_storage").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_vs_stock").isNumeric().withMessage("Stock must be a number"),
        body("inv_vs_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_vs_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_vs_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_vs_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.create
);

/**
 * @swagger
 * /api/v1/inventory/variant-storages/{id}:
 *   put:
 *     summary: Update a variant storage
 *     description: Updates an existing variant storage entry
 *     tags: [Inventory Variant Storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Variant storage ID
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
 *               id_inv_storage:
 *                 type: integer
 *                 minimum: 1
 *                 description: Storage location ID
 *               inv_vs_stock:
 *                 type: number
 *                 description: Current stock level
 *               inv_vs_stock_reserved:
 *                 type: number
 *                 description: Reserved stock level
 *               inv_vs_stock_committed:
 *                 type: number
 *                 description: Committed stock level
 *               inv_vs_stock_prev:
 *                 type: number
 *                 description: Previous stock level
 *               inv_vs_stock_min:
 *                 type: number
 *                 description: Minimum stock level
 *     responses:
 *       200:
 *         description: Variant storage updated
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
 *                   example: Variant storage updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Variant storage not found
 */
router.put(
    "/:id",
    [
        authMiddleware,
        companyMiddleware,
        param("id").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_var_id").optional().isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("id_inv_storage").optional().isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_vs_stock").optional().isNumeric().withMessage("Stock must be a number"),
        body("inv_vs_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_vs_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_vs_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_vs_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.update
);

/**
 * @route DELETE /api/v1/inventory/variant-storages/:id
 * @desc Delete an existing variant storage
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the variant storage
 * @returns {Object} Success message
 * @example
 * DELETE /api/v1/inventory/variant-storages/789
 * Response: {
 *   "success": true,
 *   "message": "Variant storage deleted"
 * }
 */
// router.delete(
//     "/:id",
//     [
//         authMiddleware,
//         companyMiddleware,
//         param("id").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
//         validatorRequestMiddleware
//     ],
//     InventoryVariantStoragesController.delete
// );

/**
 * @swagger
 * /api/v1/inventory/variant-storages/variant/{variantId}/storage/{storageId}/stock:
 *   patch:
 *     summary: Update stock levels for a variant storage
 *     description: Updates stock levels for a specific variant at a specific storage location
 *     tags: [Inventory Variant Storages]
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
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Storage location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_vs_stock:
 *                 type: number
 *                 description: Current stock level
 *                 example: 200.0
 *               inv_vs_stock_reserved:
 *                 type: number
 *                 description: Reserved stock level
 *                 example: 20.0
 *               inv_vs_stock_committed:
 *                 type: number
 *                 description: Committed stock level
 *               inv_vs_stock_prev:
 *                 type: number
 *                 description: Previous stock level
 *               inv_vs_stock_min:
 *                 type: number
 *                 description: Minimum stock level
 *                 example: 30.0
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *                   example: Stock updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Variant storage not found
 */
router.patch(
    "/variant/:variantId/storage/:storageId/stock",
    [
        authMiddleware,
        companyMiddleware,
        param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_vs_stock").optional().isNumeric().withMessage("Stock must be a number"),
        body("inv_vs_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_vs_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_vs_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_vs_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.updateStock
);

export default router; 