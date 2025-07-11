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
 * @route GET /api/v1/inventory/lots-storages/variant/:variantId
 * @desc Get all lot storages for a specific inventory variant
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of lot storages with pagination info
 * @example
 * GET /api/v1/inventory/lots-storages/variant/123?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 25,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 3
 *   },
 *   "message": "Lot storages found"
 * }
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
 * @route GET /api/v1/inventory/lots-storages/lot/:lotId
 * @desc Get all lot storages for a specific inventory lot
 * @access Private (requires authentication and company context)
 * @param {number} lotId - The ID of the inventory lot
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of lot storages with pagination info
 * @example
 * GET /api/v1/inventory/lots-storages/lot/456?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 15,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 2
 *   },
 *   "message": "Lot storages found"
 * }
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
 * @route GET /api/v1/inventory/lots-storages/lot/:lotId/storage/:storageId
 * @desc Get a specific lot storage by lot ID and storage ID
 * @access Private (requires authentication and company context)
 * @param {number} lotId - The ID of the inventory lot
 * @param {number} storageId - The ID of the storage location
 * @returns {Object} The lot storage details
 * @example
 * GET /api/v1/inventory/lots-storages/lot/456/storage/789
 * Response: {
 *   "success": true,
 *   "data": {
 *     "inv_lot_storage_id": 101,
 *     "inv_var_id": 123,
 *     "inv_lot_id": 456,
 *     "id_inv_storage": 789,
 *     "inv_ls_stock": 50.5,
 *     "inv_ls_stock_reserved": 5.0,
 *     ...
 *   },
 *   "message": "Lot storage found"
 * }
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
 * @route GET /api/v1/inventory/lots-storages/lot/:lotId/stock-summary
 * @desc Get stock summary for a specific inventory lot
 * @access Private (requires authentication and company context)
 * @param {number} lotId - The ID of the inventory lot
 * @returns {Object} Stock summary statistics across all storage locations
 * @example
 * GET /api/v1/inventory/lots-storages/lot/456/stock-summary
 * Response: {
 *   "success": true,
 *   "data": {
 *     "total_stock": 250.5,
 *     "total_reserved": 25.0,
 *     "total_committed": 15.0,
 *     "total_prev": 200.0,
 *     "total_min": 50.0,
 *     "storage_locations": 2
 *   },
 *   "message": "Stock summary found"
 * }
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
 * @route GET /api/v1/inventory/lots-storages/location/:storageId
 * @desc Get all lot storages for a specific storage location
 * @access Private (requires authentication and company context)
 * @param {number} storageId - The ID of the storage location
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of lot storages with pagination info
 * @example
 * GET /api/v1/inventory/lots-storages/location/789?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 20,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 2
 *   },
 *   "message": "Location storages found"
 * }
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
 * @route GET /api/v1/inventory/lots-storages/variant/:variantId/lot/:lotId
 * @desc Get all lot storages for a specific variant and lot combination
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @param {number} lotId - The ID of the inventory lot
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of lot storages with pagination info
 * @example
 * GET /api/v1/inventory/lots-storages/variant/123/lot/456?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 8,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 1
 *   },
 *   "message": "Variant lot storages found"
 * }
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
 * @route POST /api/v1/inventory/lots-storages
 * @desc Create a new lot storage
 * @access Private (requires authentication and company context)
 * @body {Object} storageData - The lot storage data
 * @body {number} storageData.inv_var_id - The inventory variant ID (required)
 * @body {number} storageData.inv_lot_id - The inventory lot ID (required)
 * @body {number} storageData.id_inv_storage - The storage location ID (required)
 * @body {number} storageData.inv_ls_stock - The current stock level (required)
 * @body {number} [storageData.inv_ls_stock_reserved] - The reserved stock level (optional)
 * @body {number} [storageData.inv_ls_stock_committed] - The committed stock level (optional)
 * @body {number} [storageData.inv_ls_stock_prev] - The previous stock level (optional)
 * @body {number} [storageData.inv_ls_stock_min] - The minimum stock level (optional)
 * @returns {Object} The created lot storage
 * @example
 * POST /api/v1/inventory/lots-storages
 * Body: {
 *   "inv_var_id": 123,
 *   "inv_lot_id": 456,
 *   "id_inv_storage": 789,
 *   "inv_ls_stock": 50.5,
 *   "inv_ls_stock_reserved": 5.0,
 *   "inv_ls_stock_min": 10.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Lot storage created"
 * }
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
 * @route PUT /api/v1/inventory/lots-storages/:id
 * @desc Update an existing lot storage
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the lot storage
 * @body {Object} storageData - The lot storage data to update
 * @body {number} [storageData.inv_var_id] - The inventory variant ID (optional)
 * @body {number} [storageData.inv_lot_id] - The inventory lot ID (optional)
 * @body {number} [storageData.id_inv_storage] - The storage location ID (optional)
 * @body {number} [storageData.inv_ls_stock] - The current stock level (optional)
 * @body {number} [storageData.inv_ls_stock_reserved] - The reserved stock level (optional)
 * @body {number} [storageData.inv_ls_stock_committed] - The committed stock level (optional)
 * @body {number} [storageData.inv_ls_stock_prev] - The previous stock level (optional)
 * @body {number} [storageData.inv_ls_stock_min] - The minimum stock level (optional)
 * @returns {Object} The updated lot storage
 * @example
 * PUT /api/v1/inventory/lots-storages/101
 * Body: {
 *   "inv_ls_stock": 75.0,
 *   "inv_ls_stock_reserved": 7.5,
 *   "inv_ls_stock_min": 15.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Lot storage updated"
 * }
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
 * @route DELETE /api/v1/inventory/lots-storages/:id
 * @desc Delete an existing lot storage
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the lot storage
 * @returns {Object} Success message
 * @example
 * DELETE /api/v1/inventory/lots-storages/101
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
 * @route PATCH /api/v1/inventory/lots-storages/lot/:lotId/storage/:storageId/stock
 * @desc Update stock levels for a specific lot storage
 * @access Private (requires authentication and company context)
 * @param {number} lotId - The ID of the inventory lot
 * @param {number} storageId - The ID of the storage location
 * @body {Object} stockData - The stock data to update
 * @body {number} [stockData.inv_ls_stock] - The current stock level (optional)
 * @body {number} [stockData.inv_ls_stock_reserved] - The reserved stock level (optional)
 * @body {number} [stockData.inv_ls_stock_committed] - The committed stock level (optional)
 * @body {number} [stockData.inv_ls_stock_prev] - The previous stock level (optional)
 * @body {number} [stockData.inv_ls_stock_min] - The minimum stock level (optional)
 * @returns {Object} The updated lot storage
 * @example
 * PATCH /api/v1/inventory/lots-storages/lot/456/storage/789/stock
 * Body: {
 *   "inv_ls_stock": 100.0,
 *   "inv_ls_stock_reserved": 10.0,
 *   "inv_ls_stock_min": 20.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Stock updated successfully"
 * }
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