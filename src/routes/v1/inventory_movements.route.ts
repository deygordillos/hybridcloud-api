import { Router } from "express";
import { InventoryMovementsController } from "../../controllers/inventory_movements.controller";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { body, param, query } from "express-validator";

/**
 * Inventory Movements Routes
 * 
 * This module contains all the routes for managing inventory movements.
 * Inventory movements track stock movements (in, out, transfer) for inventory variants
 * and lots at specific storage locations. This includes movement types, quantities,
 * reasons, and related documents.
 * 
 * All routes require authentication and company context.
 * 
 * @module inventory_movements.route
 */

const router = Router();

/**
 * @swagger
 * /v1/inventory/movements/variant/{variantId}:
 *   get:
 *     summary: Get all movements for a specific variant
 *     description: Retrieves all movements for a specific inventory variant with pagination
 *     tags: [inventory-movements]
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
 *         description: Variant movements found
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
 *                       inv_mov_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 10
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 5
 *                       inv_sto_id:
 *                         type: integer
 *                         example: 2
 *                       mov_type:
 *                         type: string
 *                         example: "IN"
 *                       mov_quantity:
 *                         type: number
 *                         example: 100
 *                       mov_reason:
 *                         type: string
 *                         example: "Purchase order #123"
 *                       mov_document_ref:
 *                         type: string
 *                         example: "PO-123"
 *                       mov_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-11T10:30:00Z"
 *                       created_by:
 *                         type: integer
 *                         example: 1
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
 *                   example: Variant movements found
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
    InventoryMovementsController.getMovementsByVariantId
);

/**
 * @swagger
 * /v1/inventory/movements/lot/{lotId}:
 *   get:
 *     summary: Get all movements for a specific lot
 *     description: Retrieves all movements for a specific inventory lot with pagination
 *     tags: [inventory-movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory lot ID
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
 *         description: Lot movements found
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
 *                   example: Lot movements found
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
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
    InventoryMovementsController.getMovementsByLotId
);

/**
 * @route GET /v1/inventory/movements/storage/:storageId
 * @desc Get all movements for a specific storage location
 * @access Private (requires authentication and company context)
 * @param {number} storageId - The ID of the storage location
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of movements with pagination info
 * @example
 * GET /v1/inventory/movements/storage/789?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 20,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 2
 *   },
 *   "message": "Storage movements found"
 * }
 */
router.get(
    "/storage/:storageId",
    [
        authMiddleware,
        companyMiddleware,
        param("storageId").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementsByStorageId
);

/**
 * @route GET /v1/inventory/movements/type/:type
 * @desc Get all movements by movement type
 * @access Private (requires authentication and company context)
 * @param {number} type - The movement type (1: In, 2: Out, 3: Transfer)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of movements with pagination info
 * @example
 * GET /v1/inventory/movements/type/1?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 30,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 3
 *   },
 *   "message": "Type movements found"
 * }
 */
router.get(
    "/type/:type",
    [
        authMiddleware,
        companyMiddleware,
        param("type").isInt({ min: 1, max: 3 }).withMessage("Type must be 1, 2, or 3"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementsByType
);

/**
 * @route GET /v1/inventory/movements/user/:userId
 * @desc Get all movements by user ID
 * @access Private (requires authentication and company context)
 * @param {number} userId - The ID of the user
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of movements with pagination info
 * @example
 * GET /v1/inventory/movements/user/101?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 12,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 2
 *   },
 *   "message": "User movements found"
 * }
 */
router.get(
    "/user/:userId",
    [
        authMiddleware,
        companyMiddleware,
        param("userId").isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementsByUserId
);

/**
 * @route GET /v1/inventory/movements/statistics
 * @desc Get movement statistics
 * @access Private (requires authentication and company context)
 * @query {string} [startDate] - Start date for filtering (ISO format)
 * @query {string} [endDate] - End date for filtering (ISO format)
 * @query {number} [movement_type] - Movement type filter (1, 2, or 3)
 * @returns {Object} Movement statistics
 * @example
 * GET /v1/inventory/movements/statistics?startDate=2024-01-01&endDate=2024-12-31
 * Response: {
 *   "success": true,
 *   "data": {
 *     "total_movements": 150,
 *     "total_in": 500.5,
 *     "total_out": 300.2,
 *     "total_transfer": 50.0,
 *     "unique_variants": 25,
 *     "unique_storages": 5
 *   },
 *   "message": "Movement statistics found"
 * }
 */
router.get(
    "/statistics",
    [
        authMiddleware,
        companyMiddleware,
        query("startDate").optional().isISO8601().withMessage("Start date must be in ISO format"),
        query("endDate").optional().isISO8601().withMessage("End date must be in ISO format"),
        query("movement_type").optional().isInt({ min: 1, max: 3 }).withMessage("Movement type must be 1, 2, or 3"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementStatistics
);

/**
 * @route GET /v1/inventory/movements/date-range/:startDate/:endDate
 * @desc Get movements by date range
 * @access Private (requires authentication and company context)
 * @param {string} startDate - Start date (YYYY-MM-DD format)
 * @param {string} endDate - End date (YYYY-MM-DD format)
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of movements with pagination info
 * @example
 * GET /v1/inventory/movements/date-range/2024-01-01/2024-12-31?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 45,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 5
 *   },
 *   "message": "Date range movements found"
 * }
 */
router.get(
    "/date-range/:startDate/:endDate",
    [
        authMiddleware,
        companyMiddleware,
        param("startDate").isDate().withMessage("Start date must be in YYYY-MM-DD format"),
        param("endDate").isDate().withMessage("End date must be in YYYY-MM-DD format"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementsByDateRange
);

/**
 * @route GET /v1/inventory/movements/related-doc/:relatedDoc
 * @desc Get movements by related document
 * @access Private (requires authentication and company context)
 * @param {string} relatedDoc - The related document identifier
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page (max 100)
 * @returns {Object} Array of movements with pagination info
 * @example
 * GET /v1/inventory/movements/related-doc/INV-2024-001?page=1&limit=10
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "total": 8,
 *     "perPage": 10,
 *     "currentPage": 1,
 *     "lastPage": 1
 *   },
 *   "message": "Related document movements found"
 * }
 */
router.get(
    "/related-doc/:relatedDoc",
    [
        authMiddleware,
        companyMiddleware,
        param("relatedDoc").notEmpty().withMessage("Related document is required"),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getMovementsByRelatedDoc
);

/**
 * @route GET /v1/inventory/movements/latest
 * @desc Get latest movements
 * @access Private (requires authentication and company context)
 * @query {number} [limit=10] - Number of latest movements to retrieve (max 100)
 * @returns {Object} Array of latest movements
 * @example
 * GET /v1/inventory/movements/latest?limit=5
 * Response: {
 *   "success": true,
 *   "data": [...],
 *   "message": "Latest movements found"
 * }
 */
router.get(
    "/latest",
    [
        authMiddleware,
        companyMiddleware,
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.getLatestMovements
);

/**
 * @swagger
 * /v1/inventory/movements:
 *   post:
 *     summary: Create a new inventory movement
 *     description: Creates a new inventory movement (in, out, or transfer)
 *     tags: [inventory-movements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_inv_storage
 *               - inv_var_id
 *               - movement_type
 *               - quantity
 *             properties:
 *               id_inv_storage:
 *                 type: integer
 *                 minimum: 1
 *                 description: Storage location ID
 *                 example: 789
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory variant ID
 *                 example: 123
 *               inv_lot_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory lot ID (optional)
 *                 example: 456
 *               movement_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Movement type (1=In, 2=Out, 3=Transfer)
 *                 example: 1
 *               quantity:
 *                 type: number
 *                 description: Quantity of the movement
 *                 example: 50.5
 *               movement_reason:
 *                 type: string
 *                 description: Reason for the movement
 *                 example: Stock replenishment
 *               related_doc:
 *                 type: string
 *                 maxLength: 100
 *                 description: Related document reference
 *                 example: INV-2024-001
 *     responses:
 *       201:
 *         description: Inventory movement created
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
 *                   example: Inventory movement created
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
        body("id_inv_storage").isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_var_id").isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("inv_lot_id").optional().isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        body("movement_type").isInt({ min: 1, max: 3 }).withMessage("Movement type must be 1, 2, or 3"),
        body("quantity").isNumeric().withMessage("Quantity must be a number"),
        body("movement_reason").optional().isString().withMessage("Movement reason must be a string"),
        body("related_doc").optional().isString().isLength({ max: 100 }).withMessage("Related document must be a string (max 100 chars)"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.create
);

/**
 * @route PUT /v1/inventory/movements/:id
 * @desc Update an existing inventory movement
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the movement
 * @body {Object} movementData - The movement data to update
 * @body {number} [movementData.id_inv_storage] - The storage location ID (optional)
 * @body {number} [movementData.inv_var_id] - The inventory variant ID (optional)
 * @body {number} [movementData.inv_lot_id] - The inventory lot ID (optional)
 * @body {number} [movementData.movement_type] - The movement type (optional, 1: In, 2: Out, 3: Transfer)
 * @body {number} [movementData.quantity] - The quantity of the movement (optional)
 * @body {string} [movementData.movement_reason] - The reason for the movement (optional)
 * @body {string} [movementData.related_doc] - The related document (optional, max 100 chars)
 * @returns {Object} The updated movement
 * @example
 * PUT /v1/inventory/movements/101
 * Body: {
 *   "quantity": 75.0,
 *   "movement_reason": "Updated reason",
 *   "related_doc": "INV-2024-002"
 * }
 * Response: {
 *   "success": true,
 *   "data": {...},
 *   "message": "Inventory movement updated"
 * }
 */
router.put(
    "/:id",
    [
        authMiddleware,
        companyMiddleware,
        param("id").isInt({ min: 1 }).withMessage("Movement ID must be a positive integer"),
        body("id_inv_storage").optional().isInt({ min: 1 }).withMessage("Storage ID must be a positive integer"),
        body("inv_var_id").optional().isInt({ min: 1 }).withMessage("Variant ID must be a positive integer"),
        body("inv_lot_id").optional().isInt({ min: 1 }).withMessage("Lot ID must be a positive integer"),
        body("movement_type").optional().isInt({ min: 1, max: 3 }).withMessage("Movement type must be 1, 2, or 3"),
        body("quantity").optional().isNumeric().withMessage("Quantity must be a number"),
        body("movement_reason").optional().isString().withMessage("Movement reason must be a string"),
        body("related_doc").optional().isString().isLength({ max: 100 }).withMessage("Related document must be a string (max 100 chars)"),
        validatorRequestMiddleware
    ],
    InventoryMovementsController.update
);

/**
 * @route DELETE /v1/inventory/movements/:id
 * @desc Delete an existing inventory movement
 * @access Private (requires authentication and company context)
 * @param {number} id - The ID of the movement
 * @returns {Object} Success message
 * @example
 * DELETE /v1/inventory/movements/101
 * Response: {
 *   "success": true,
 *   "message": "Inventory movement deleted"
 * }
 */
// router.delete(
//     "/:id",
//     [
//         authMiddleware,
//         companyMiddleware,
//         param("id").isInt({ min: 1 }).withMessage("Movement ID must be a positive integer"),
//         validatorRequestMiddleware
//     ],
//     InventoryMovementsController.delete
// );

export default router; 