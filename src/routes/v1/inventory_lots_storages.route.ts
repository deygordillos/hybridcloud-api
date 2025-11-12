import { Router } from "express";
import { InventoryLotsStoragesController } from "../../controllers/inventory_lots_storages.controller";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { body, param, query } from "express-validator";

/**
 * Inventory Lots Storages Routes
 * 
 * This module contains all the routes for managing inventory lots storages.
 * Inventory lots storages track stock levels for inventory lots at specific storage locations.
 * This includes current stock, reserved stock, committed stock, previous stock, and minimum stock levels.
 * 
 * All routes require authentication and company context.
 * 
 * @module inventory_lots_storages.route
 */

const router = Router();

/**
 * @swagger
 * /v1/inventory/lots-storages/variant/{variantId}:
 *   get:
 *     summary: Get all lot storages for a specific inventory variant
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the inventory variant
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Success
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
 *                       inv_ls_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 5
 *                       id_inv_storage:
 *                         type: integer
 *                         example: 2
 *                       inv_ls_stock:
 *                         type: number
 *                         example: 100.5
 *                       inv_ls_stock_reserved:
 *                         type: number
 *                         example: 10.0
 *                       inv_ls_stock_committed:
 *                         type: number
 *                         example: 5.0
 *                       inv_ls_stock_prev:
 *                         type: number
 *                         example: 95.0
 *                       inv_ls_stock_min:
 *                         type: number
 *                         example: 20.0
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
 *                   example: Lot storages retrieved successfully
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
    InventoryLotsStoragesController.getStoragesByVariantId
);

/**
 * @swagger
 * /v1/inventory/lots-storages/lot/{lotId}:
 *   get:
 *     summary: Get all lot storages for a specific inventory lot
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory lot
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
 *         description: Lot storages found successfully
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
 *                       inv_ls_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 5
 *                       id_inv_storage:
 *                         type: integer
 *                         example: 2
 *                       inv_ls_stock:
 *                         type: number
 *                         example: 100.5
 *                       inv_ls_stock_reserved:
 *                         type: number
 *                         example: 10.0
 *                       inv_ls_stock_committed:
 *                         type: number
 *                         example: 5.0
 *                       storage_name:
 *                         type: string
 *                         example: Main Warehouse
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 8
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Lot storages found successfully
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
 *       400:
 *         description: Invalid parameters
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
 *                         example: lotId
 *                       message:
 *                         type: string
 *                         example: Lot ID must be a positive integer
 */
router.get(
    "/lot/:lotId",
    [
        authMiddleware,
        companyMiddleware,
        param("lotId").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.getStoragesByLotId
);

/**
 * @swagger
 * /v1/inventory/lots-storages/lot/{lotId}/storage/{storageId}:
 *   get:
 *     summary: Get a specific lot storage by lot ID and storage ID
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory lot
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the storage location
 *     responses:
 *       200:
 *         description: Lot storage found successfully
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
 *                     inv_ls_id:
 *                       type: integer
 *                       example: 1
 *                     inv_var_id:
 *                       type: integer
 *                       example: 10
 *                     inv_lot_id:
 *                       type: integer
 *                       example: 5
 *                     id_inv_storage:
 *                       type: integer
 *                       example: 2
 *                     inv_ls_stock:
 *                       type: number
 *                       example: 100.5
 *                     inv_ls_stock_reserved:
 *                       type: number
 *                       example: 10.0
 *                     inv_ls_stock_committed:
 *                       type: number
 *                       example: 5.0
 *                     inv_ls_stock_prev:
 *                       type: number
 *                       example: 95.0
 *                     inv_ls_stock_min:
 *                       type: number
 *                       example: 20.0
 *                 message:
 *                   type: string
 *                   example: Lot storage found successfully
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
 *       404:
 *         description: Lot storage not found
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
 *                   example: Lot storage not found
 */
router.get(
    "/lot/:lotId/storage/:storageId",
    [
        authMiddleware,
        companyMiddleware,
        param("lotId").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.getStorageByLotAndStorage
);

/**
 * @swagger
 * /v1/inventory/lots-storages/lot/{lotId}/stock-summary:
 *   get:
 *     summary: Get stock summary for a specific inventory lot
 *     description: Returns aggregated stock statistics across all storage locations for the specified lot
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory lot
 *     responses:
 *       200:
 *         description: Stock summary retrieved successfully
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
 *                     inv_lot_id:
 *                       type: integer
 *                       example: 5
 *                     total_stock:
 *                       type: number
 *                       example: 500.5
 *                     total_reserved:
 *                       type: number
 *                       example: 50.0
 *                     total_committed:
 *                       type: number
 *                       example: 25.0
 *                     available_stock:
 *                       type: number
 *                       example: 425.5
 *                     storage_locations:
 *                       type: integer
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: Stock summary retrieved successfully
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
 *       404:
 *         description: Lot not found
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
 *                   example: Lot not found
 */
router.get(
    "/lot/:lotId/stock-summary",
    [
        authMiddleware,
        companyMiddleware,
        param("lotId").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.getStockSummaryByLotId
);

/**
 * @swagger
 * /v1/inventory/lots-storages/location/{storageId}:
 *   get:
 *     summary: Get all lot storages for a specific storage location
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the storage location
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
 *         description: Location storages found successfully
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
 *                       inv_ls_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 5
 *                       lot_number:
 *                         type: string
 *                         example: LOT-2025-001
 *                       inv_ls_stock:
 *                         type: number
 *                         example: 100.5
 *                       inv_ls_stock_reserved:
 *                         type: number
 *                         example: 10.0
 *                       inv_ls_stock_committed:
 *                         type: number
 *                         example: 5.0
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
 *                   example: Location storages found successfully
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
 *       400:
 *         description: Invalid parameters
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
 *                         example: storageId
 *                       message:
 *                         type: string
 *                         example: Storage ID must be a positive integer
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
    InventoryLotsStoragesController.getStoragesByLocationId
);

/**
 * @swagger
 * /v1/inventory/lots-storages/variant/{variantId}/lot/{lotId}:
 *   get:
 *     summary: Get all lot storages for a specific variant and lot combination
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory variant
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory lot
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
 *         description: Variant lot storages found successfully
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
 *                       inv_ls_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 5
 *                       id_inv_storage:
 *                         type: integer
 *                         example: 2
 *                       storage_name:
 *                         type: string
 *                         example: Main Warehouse
 *                       inv_ls_stock:
 *                         type: number
 *                         example: 100.5
 *                       inv_ls_stock_reserved:
 *                         type: number
 *                         example: 10.0
 *                       inv_ls_stock_committed:
 *                         type: number
 *                         example: 5.0
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Variant lot storages found successfully
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
 *       400:
 *         description: Invalid parameters
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
 */
router.get(
    "/variant/:variantId/lot/:lotId",
    [
        authMiddleware,
        companyMiddleware,
        param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        param("lotId").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.getStoragesByVariantAndLot
);

/**
 * @swagger
 * /v1/inventory/lots-storages:
 *   post:
 *     summary: Create a new lot storage
 *     description: Creates a new inventory lot storage record tracking stock levels at a specific location
 *     tags: [inventory-lots-storages]
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
 *               - inv_lot_id
 *               - id_inv_storage
 *               - inv_ls_stock
 *             properties:
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The inventory variant ID
 *                 example: 123
 *               inv_lot_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The inventory lot ID
 *                 example: 456
 *               id_inv_storage:
 *                 type: integer
 *                 minimum: 1
 *                 description: The storage location ID
 *                 example: 789
 *               inv_ls_stock:
 *                 type: number
 *                 description: The current stock level
 *                 example: 50.5
 *               inv_ls_stock_reserved:
 *                 type: number
 *                 description: The reserved stock level
 *                 example: 5.0
 *               inv_ls_stock_committed:
 *                 type: number
 *                 description: The committed stock level
 *                 example: 0
 *               inv_ls_stock_prev:
 *                 type: number
 *                 description: The previous stock level
 *                 example: 45.0
 *               inv_ls_stock_min:
 *                 type: number
 *                 description: The minimum stock level
 *                 example: 10.0
 *     responses:
 *       201:
 *         description: Lot storage created successfully
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
 *                     inv_ls_id:
 *                       type: integer
 *                       example: 1
 *                     inv_var_id:
 *                       type: integer
 *                       example: 123
 *                     inv_lot_id:
 *                       type: integer
 *                       example: 456
 *                     id_inv_storage:
 *                       type: integer
 *                       example: 789
 *                     inv_ls_stock:
 *                       type: number
 *                       example: 50.5
 *                     inv_ls_stock_reserved:
 *                       type: number
 *                       example: 5.0
 *                     inv_ls_stock_committed:
 *                       type: number
 *                       example: 0
 *                     inv_ls_stock_prev:
 *                       type: number
 *                       example: 45.0
 *                     inv_ls_stock_min:
 *                       type: number
 *                       example: 10.0
 *                 message:
 *                   type: string
 *                   example: Lot storage created successfully
 *       400:
 *         description: Invalid input
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
 *                         example: inv_var_id
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
 */
router.post(
    "/",
    [
        authMiddleware,
        companyMiddleware,
        body("inv_var_id").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("inv_lot_id").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        body("id_inv_storage").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_ls_stock").isNumeric().withMessage("Stock must be a number"),
        body("inv_ls_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_ls_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_ls_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_ls_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.create
);

/**
 * @swagger
 * /v1/inventory/lots-storages/{id}:
 *   put:
 *     summary: Update an existing lot storage
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the lot storage
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
 *                 description: The inventory variant ID
 *               inv_lot_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: The inventory lot ID
 *               id_inv_storage:
 *                 type: integer
 *                 minimum: 1
 *                 description: The storage location ID
 *               inv_ls_stock:
 *                 type: number
 *                 description: The current stock level
 *                 example: 75.0
 *               inv_ls_stock_reserved:
 *                 type: number
 *                 description: The reserved stock level
 *                 example: 7.5
 *               inv_ls_stock_committed:
 *                 type: number
 *                 description: The committed stock level
 *               inv_ls_stock_prev:
 *                 type: number
 *                 description: The previous stock level
 *               inv_ls_stock_min:
 *                 type: number
 *                 description: The minimum stock level
 *                 example: 15.0
 *     responses:
 *       200:
 *         description: Lot storage updated successfully
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
 *                     inv_ls_id:
 *                       type: integer
 *                       example: 1
 *                     inv_var_id:
 *                       type: integer
 *                       example: 10
 *                     inv_lot_id:
 *                       type: integer
 *                       example: 5
 *                     id_inv_storage:
 *                       type: integer
 *                       example: 2
 *                     inv_ls_stock:
 *                       type: number
 *                       example: 75.0
 *                     inv_ls_stock_reserved:
 *                       type: number
 *                       example: 7.5
 *                     inv_ls_stock_min:
 *                       type: number
 *                       example: 15.0
 *                 message:
 *                   type: string
 *                   example: Lot storage updated successfully
 *       400:
 *         description: Invalid input
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
 *                         example: inv_ls_stock
 *                       message:
 *                         type: string
 *                         example: Stock must be a number
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
 *       404:
 *         description: Lot storage not found
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
 *                   example: Lot storage not found
 */
router.put(
    "/:id",
    [
        authMiddleware,
        companyMiddleware,
        param("id").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_var_id").optional().isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("inv_lot_id").optional().isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        body("id_inv_storage").optional().isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_ls_stock").optional().isNumeric().withMessage("Stock must be a number"),
        body("inv_ls_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_ls_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_ls_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_ls_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.update
);

/**
 * @route DELETE /v1/inventory/lots-storages/:id
 * @desc Delete an existing lot storage
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the lot storage
 * @returns {Object} Success message
 * @example
 * DELETE /v1/inventory/lots-storages/101
 * Response: {
 *   "success": true,
 *   "message": "Lot storage deleted"
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
//     InventoryLotsStoragesController.delete
// );

/**
 * @swagger
 * /v1/inventory/lots-storages/lot/{lotId}/storage/{storageId}/stock:
 *   patch:
 *     summary: Update stock levels for a specific lot storage
 *     description: Partially updates the stock levels for a specific lot at a storage location
 *     tags: [inventory-lots-storages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the inventory lot
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the storage location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_ls_stock:
 *                 type: number
 *                 description: The current stock level
 *                 example: 100.0
 *               inv_ls_stock_reserved:
 *                 type: number
 *                 description: The reserved stock level
 *                 example: 10.0
 *               inv_ls_stock_committed:
 *                 type: number
 *                 description: The committed stock level
 *               inv_ls_stock_prev:
 *                 type: number
 *                 description: The previous stock level
 *               inv_ls_stock_min:
 *                 type: number
 *                 description: The minimum stock level
 *                 example: 20.0
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
 *                   properties:
 *                     inv_ls_id:
 *                       type: integer
 *                       example: 1
 *                     inv_lot_id:
 *                       type: integer
 *                       example: 5
 *                     id_inv_storage:
 *                       type: integer
 *                       example: 2
 *                     inv_ls_stock:
 *                       type: number
 *                       example: 100.0
 *                     inv_ls_stock_reserved:
 *                       type: number
 *                       example: 10.0
 *                     inv_ls_stock_min:
 *                       type: number
 *                       example: 20.0
 *                 message:
 *                   type: string
 *                   example: Stock updated successfully
 *       400:
 *         description: Invalid input
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
 *                         example: inv_ls_stock
 *                       message:
 *                         type: string
 *                         example: Stock must be a number
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
 *       404:
 *         description: Lot storage not found
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
 *                   example: Lot storage not found
 */
router.patch(
    "/lot/:lotId/storage/:storageId/stock",
    [
        authMiddleware,
        companyMiddleware,
        param("lotId").isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_ls_stock").optional().isNumeric().withMessage("Stock must be a number"),
        body("inv_ls_stock_reserved").optional().isNumeric().withMessage("Reserved stock must be a number"),
        body("inv_ls_stock_committed").optional().isNumeric().withMessage("Committed stock must be a number"),
        body("inv_ls_stock_prev").optional().isNumeric().withMessage("Previous stock must be a number"),
        body("inv_ls_stock_min").optional().isNumeric().withMessage("Minimum stock must be a number"),
        validatorRequestMiddleware
    ],
    InventoryLotsStoragesController.updateStock
);

export default router; 