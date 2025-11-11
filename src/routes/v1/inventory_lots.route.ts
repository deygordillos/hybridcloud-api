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
 * @swagger
 * /api/v1/inventory/lots/variant/{variantId}:
 *   get:
 *     summary: Get all inventory lots for a specific variant
 *     description: Retrieves all inventory lots associated with a specific inventory variant
 *     tags: [Inventory Lots]
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
 *         description: Inventory lots retrieved successfully
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
 *                       inv_lot_id:
 *                         type: integer
 *                         example: 1
 *                       inv_var_id:
 *                         type: integer
 *                         example: 123
 *                       lot_number:
 *                         type: string
 *                         example: LOT-2024-001
 *                       lot_status:
 *                         type: integer
 *                         example: 1
 *                       expiration_date:
 *                         type: string
 *                         format: date
 *                         example: 2024-12-31
 *                       manufacture_date:
 *                         type: string
 *                         format: date
 *                         example: 2024-01-15
 *                       lot_unit_cost:
 *                         type: number
 *                         example: 25.50
 *                 message:
 *                   type: string
 *                   example: Inventory lots retrieved successfully
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
    InventoryLotsController.getByVariantId
);

/**
 * @swagger
 * /api/v1/inventory/lots/search/{lotNumber}:
 *   get:
 *     summary: Search inventory lots by lot number
 *     description: Searches for inventory lots matching the specified lot number
 *     tags: [Inventory Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lotNumber
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Lot number to search for
 *         example: LOT123
 *     responses:
 *       200:
 *         description: Inventory lots retrieved successfully
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
 *                   example: Inventory lots retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
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
 * @swagger
 * /api/v1/inventory/lots/summary/stats:
 *   get:
 *     summary: Get inventory lots summary statistics
 *     description: Retrieves summary statistics including total, active, inactive, expiring soon, and expired lots
 *     tags: [Inventory Lots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lots summary retrieved successfully
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
 *                     totalLots:
 *                       type: integer
 *                       example: 150
 *                     activeLots:
 *                       type: integer
 *                       example: 120
 *                     inactiveLots:
 *                       type: integer
 *                       example: 30
 *                     expiringSoon:
 *                       type: integer
 *                       example: 5
 *                     expiredLots:
 *                       type: integer
 *                       example: 2
 *                 message:
 *                   type: string
 *                   example: Lots summary retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 */
router.get('/summary/stats',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryLotsController.getSummary
);

/**
 * @swagger
 * /api/v1/inventory/lots/{id}:
 *   get:
 *     summary: Get a specific inventory lot by ID
 *     description: Retrieves details of a specific inventory lot
 *     tags: [Inventory Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory lot ID
 *     responses:
 *       200:
 *         description: Inventory lot retrieved successfully
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
 *                       example: 456
 *                     lot_number:
 *                       type: string
 *                       example: LOT123
 *                     lot_status:
 *                       type: integer
 *                       example: 1
 *                     expiration_date:
 *                       type: string
 *                       example: 2024-12-31
 *                 message:
 *                   type: string
 *                   example: Inventory lot retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Lot not found
 */
router.get('/:id',
    [
        authMiddleware,
        companyMiddleware,
        param("id")
            .notEmpty().withMessage("id is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id"),
        validatorRequestMiddleware
    ],
    InventoryLotsController.getById
);

/**
 * @swagger
 * /api/v1/inventory/lots:
 *   post:
 *     summary: Create a new inventory lot
 *     description: Creates a new inventory lot with optional expiration dates, costs, and notes
 *     tags: [Inventory Lots]
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
 *               - lot_number
 *             properties:
 *               inv_var_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory variant ID
 *                 example: 123
 *               lot_number:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot number
 *                 example: LOT123
 *               lot_origin:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot origin
 *                 example: Supplier A
 *               lot_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Lot status (0=inactive, 1=active)
 *                 example: 1
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: Expiration date (ISO8601 format)
 *                 example: 2024-12-31
 *               manufacture_date:
 *                 type: string
 *                 format: date
 *                 description: Manufacture date (ISO8601 format)
 *                 example: 2024-01-01
 *               lot_notes:
 *                 type: string
 *                 description: Notes about the lot
 *               lot_unit_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Unit cost
 *                 example: 25.50
 *               lot_unit_currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for unit cost
 *                 example: 1
 *               lot_unit_cost_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Reference unit cost
 *               lot_unit_currency_id_ref:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for reference cost
 *     responses:
 *       201:
 *         description: Inventory lot created successfully
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
 *                   example: Inventory lot created successfully
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
        body("lot_number")
            .notEmpty().isString().withMessage("lot_number is required")
            .isLength({ max: 100 }).withMessage("lot_number must be a string (max 100 chars)"),
        body("lot_origin")
            .optional().isString().withMessage("lot_origin must be a string")
            .isLength({ max: 100 }).withMessage("lot_origin must be a string (max 100 chars)"),
        body("lot_status")
            .optional().isInt().isIn([0, 1]).withMessage("lot_status must be 0 or 1"),
        body("expiration_date")
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional

                // Verificar si es una fecha válida
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("expiration_date must be a valid date");
                }

                // Verificar formato (solo acepta YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) {
                    throw new Error("expiration_date must be in YYYY-MM-DD format (e.g., 2025-07-16)");
                }

                return true;
            })
            .withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional

                // Validate date
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("manufacture_date must be a valid date");
                }

                // Verify format (only accepts YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) {
                    throw new Error("manufacture_date must be in YYYY-MM-DD format (e.g., 2025-07-16)");
                }

                return true;
            })
            .withMessage("manufacture_date must be a valid date"),
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
 * @swagger
 * /api/v1/inventory/lots/{id}:
 *   put:
 *     summary: Update an inventory lot (full update)
 *     description: Updates an existing inventory lot with all fields
 *     tags: [Inventory Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory lot ID
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
 *               lot_number:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot number
 *               lot_origin:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot origin
 *               lot_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Lot status (0=inactive, 1=active)
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: Expiration date (ISO8601 format)
 *               manufacture_date:
 *                 type: string
 *                 format: date
 *                 description: Manufacture date (ISO8601 format)
 *               lot_notes:
 *                 type: string
 *                 description: Notes about the lot
 *               lot_unit_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Unit cost
 *               lot_unit_currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for unit cost
 *               lot_unit_cost_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Reference unit cost
 *               lot_unit_currency_id_ref:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for reference cost
 *     responses:
 *       200:
 *         description: Inventory lot updated successfully
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
 *                   example: Inventory lot updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Lot not found
 */
router.put('/:id',
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
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional
                
                // Validate date
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("expiration_date must be a valid date");
                }
                
                // Verify format (only accepts YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) {
                    throw new Error("manufacture_date must be in YYYY-MM-DD format (e.g., 2025-07-16)");
                }
                
                return true;
            })
            .withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional
                
                // Verificar si es una fecha válida
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("manufacture_date must be a valid date");
                }
                
                // Verificar formato (acepta YYYY-MM-DD y ISO8601 completo)
                const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
                if (!isoRegex.test(value)) {
                    throw new Error("manufacture_date must be in YYYY-MM-DD or ISO8601 format");
                }
                
                return true;
            })
            .withMessage("manufacture_date must be a valid date"),
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
 * @swagger
 * /api/v1/inventory/lots/{id}:
 *   patch:
 *     summary: Update an inventory lot (partial update)
 *     description: Partially updates an existing inventory lot
 *     tags: [Inventory Lots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Inventory lot ID
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
 *               lot_number:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot number
 *               lot_origin:
 *                 type: string
 *                 maxLength: 100
 *                 description: Lot origin
 *               lot_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Lot status (0=inactive, 1=active)
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: Expiration date (ISO8601 format)
 *               manufacture_date:
 *                 type: string
 *                 format: date
 *                 description: Manufacture date (ISO8601 format)
 *               lot_notes:
 *                 type: string
 *                 description: Notes about the lot
 *               lot_unit_cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Unit cost
 *               lot_unit_currency_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for unit cost
 *               lot_unit_cost_ref:
 *                 type: number
 *                 minimum: 0
 *                 description: Reference unit cost
 *               lot_unit_currency_id_ref:
 *                 type: integer
 *                 minimum: 1
 *                 description: Currency ID for reference cost
 *     responses:
 *       200:
 *         description: Inventory lot updated successfully
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
 *                   example: Inventory lot updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Company context required
 *       404:
 *         description: Lot not found
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
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional
                
                // Verificar si es una fecha válida
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("expiration_date must be a valid date");
                }
                
                // Verify format (only accepts YYYY-MM-DD)
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) {
                    throw new Error("manufacture_date must be in YYYY-MM-DD format (e.g., 2025-07-16)");
                }
                
                return true;
            })
            .withMessage("expiration_date must be a valid date"),
        body("manufacture_date")
            .optional()
            .custom((value) => {
                if (!value) return true; // Es opcional
                
                // Verificar si es una fecha válida
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error("manufacture_date must be a valid date");
                }
                
                // Verificar formato (acepta YYYY-MM-DD y ISO8601 completo)
                const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
                if (!isoRegex.test(value)) {
                    throw new Error("manufacture_date must be in YYYY-MM-DD or ISO8601 format");
                }
                
                return true;
            })
            .withMessage("manufacture_date must be a valid date"),
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