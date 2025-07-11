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
 * @route GET /api/v1/inventory/variant-storages/variant/:variantId
 * @desc Get all variant storages for a specific inventory variant
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of variant storages with pagination info
 * @example
 * GET /api/v1/inventory/variant-storages/variant/123?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 25,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 3
 *   },
 *   "message": "Variant storages found"
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
    InventoryVariantStoragesController.getStoragesByVariantId
);

/**
 * @route GET /api/v1/inventory/variant-storages/variant/:variantId/storage/:storageId
 * @desc Get a specific variant storage by variant ID and storage ID
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @param {number} storageId - The ID of the storage location
 * @returns {Object} The variant storage details
 * @example
 * GET /api/v1/inventory/variant-storages/variant/123/storage/456
 * Response: {
 *   "success": true,
 *   "data": {
 *     "inv_var_storage_id": 789,
 *     "inv_var_id": 123,
 *     "id_inv_storage": 456,
 *     "inv_vs_stock": 100.5,
 *     "inv_vs_stock_reserved": 10.0,
 *     ...
 *   },
 *   "message": "Variant storage found"
 * }
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
 * @route GET /api/v1/inventory/variant-storages/variant/:variantId/stock-summary
 * @desc Get stock summary for a specific inventory variant
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @returns {Object} Stock summary statistics across all storage locations
 * @example
 * GET /api/v1/inventory/variant-storages/variant/123/stock-summary
 * Response: {
 *   "success": true,
 *   "data": {
 *     "total_stock": 500.5,
 *     "total_reserved": 50.0,
 *     "total_committed": 25.0,
 *     "total_prev": 450.0,
 *     "total_min": 100.0,
 *     "storage_locations": 3
 *   },
 *   "message": "Stock summary found"
 * }
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
 * @route GET /api/v1/inventory/variant-storages/location/:storageId
 * @desc Get all variant storages for a specific storage location
 * @access Private (requires authentication and company context)
 * @param {number} storageId - The ID of the storage location
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of variant storages with pagination info
 * @example
 * GET /api/v1/inventory/variant-storages/location/456?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 15,
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
    InventoryVariantStoragesController.getStoragesByLocationId
);

/**
 * @route POST /api/v1/inventory/variant-storages
 * @desc Create a new variant storage
 * @access Private (requires authentication and company context)
 * @body {Object} storageData - The variant storage data
 * @body {number} storageData.inv_var_id - The inventory variant ID (required)
 * @body {number} storageData.id_inv_storage - The storage location ID (required)
 * @body {number} storageData.inv_vs_stock - The current stock level (required)
 * @body {number} [storageData.inv_vs_stock_reserved] - The reserved stock level (optional)
 * @body {number} [storageData.inv_vs_stock_committed] - The committed stock level (optional)
 * @body {number} [storageData.inv_vs_stock_prev] - The previous stock level (optional)
 * @body {number} [storageData.inv_vs_stock_min] - The minimum stock level (optional)
 * @returns {Object} The created variant storage
 * @example
 * POST /api/v1/inventory/variant-storages
 * Body: {
 *   "inv_var_id": 123,
 *   "id_inv_storage": 456,
 *   "inv_vs_stock": 100.5,
 *   "inv_vs_stock_reserved": 10.0,
 *   "inv_vs_stock_min": 20.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Variant storage created"
 * }
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
 * @route PUT /api/v1/inventory/variant-storages/:id
 * @desc Update an existing variant storage
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the variant storage
 * @body {Object} storageData - The variant storage data to update
 * @body {number} [storageData.inv_var_id] - The inventory variant ID (optional)
 * @body {number} [storageData.id_inv_storage] - The storage location ID (optional)
 * @body {number} [storageData.inv_vs_stock] - The current stock level (optional)
 * @body {number} [storageData.inv_vs_stock_reserved] - The reserved stock level (optional)
 * @body {number} [storageData.inv_vs_stock_committed] - The committed stock level (optional)
 * @body {number} [storageData.inv_vs_stock_prev] - The previous stock level (optional)
 * @body {number} [storageData.inv_vs_stock_min] - The minimum stock level (optional)
 * @returns {Object} The updated variant storage
 * @example
 * PUT /api/v1/inventory/variant-storages/789
 * Body: {
 *   "inv_vs_stock": 150.0,
 *   "inv_vs_stock_reserved": 15.0,
 *   "inv_vs_stock_min": 25.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Variant storage updated"
 * }
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
router.delete(
    "/:id",
    [
        authMiddleware,
        companyMiddleware,
        param("id").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    InventoryVariantStoragesController.delete
);

/**
 * @route PATCH /api/v1/inventory/variant-storages/variant/:variantId/storage/:storageId/stock
 * @desc Update stock levels for a specific variant storage
 * @access Private (requires authentication and company context)
 * @param {number} variantId - The ID of the inventory variant
 * @param {number} storageId - The ID of the storage location
 * @body {Object} stockData - The stock data to update
 * @body {number} [stockData.inv_vs_stock] - The current stock level (optional)
 * @body {number} [stockData.inv_vs_stock_reserved] - The reserved stock level (optional)
 * @body {number} [stockData.inv_vs_stock_committed] - The committed stock level (optional)
 * @body {number} [stockData.inv_vs_stock_prev] - The previous stock level (optional)
 * @body {number} [stockData.inv_vs_stock_min] - The minimum stock level (optional)
 * @returns {Object} The updated variant storage
 * @example
 * PATCH /api/v1/inventory/variant-storages/variant/123/storage/456/stock
 * Body: {
 *   "inv_vs_stock": 200.0,
 *   "inv_vs_stock_reserved": 20.0,
 *   "inv_vs_stock_min": 30.0
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Stock updated successfully"
 * }
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