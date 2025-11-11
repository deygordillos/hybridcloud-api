import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryController } from '../../controllers/inventory.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/inventory:
 *   get:
 *     summary: Get all inventories for the company
 *     description: Retrieves all inventory items for the authenticated user's company
 *     tags: [inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventories retrieved successfully
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
 *                       inv_id:
 *                         type: integer
 *                         example: 1
 *                       inv_code:
 *                         type: string
 *                         example: INV-001
 *                       inv_description:
 *                         type: string
 *                         example: Product description
 *                       inv_status:
 *                         type: integer
 *                         example: 1
 *                       inv_type:
 *                         type: integer
 *                         example: 1
 *                       inv_has_variants:
 *                         type: integer
 *                         example: 1
 *                       id_inv_family:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Inventories retrieved successfully
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
router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryController.getInventoriesByCompany
);

/**
 * @swagger
 * /api/v1/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     description: Creates a new inventory item with optional variants, taxes, and attributes
 *     tags: [inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inv_code
 *               - id_inv_family
 *             properties:
 *               inv_code:
 *                 type: string
 *                 description: Inventory code (unique identifier)
 *                 example: INV-001
 *               id_inv_family:
 *                 type: integer
 *                 minimum: 1
 *                 description: Inventory family ID
 *                 example: 1
 *               inv_description:
 *                 type: string
 *                 description: Inventory description
 *                 example: Product description
 *               inv_description_detail:
 *                 type: string
 *                 description: Detailed description
 *               inv_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *               inv_type:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: Type (1=product, 2=service)
 *                 example: 1
 *               inv_has_variants:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Has variants (0=no, 1=yes)
 *                 example: 1
 *               inv_is_exempt:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is tax exempt (0=no, 1=yes)
 *                 example: 0
 *               inv_is_stockable:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is stockable (0=no, 1=yes)
 *                 example: 1
 *               inv_is_lot_managed:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is lot managed (0=no, 1=yes)
 *                 example: 0
 *               inv_brand:
 *                 type: string
 *                 description: Brand name
 *                 example: Brand A
 *               inv_model:
 *                 type: string
 *                 description: Model name
 *                 example: Model X
 *               inv_url_image:
 *                 type: string
 *                 description: URL to product image
 *               taxes:
 *                 type: array
 *                 description: Array of tax IDs
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               variants:
 *                 type: array
 *                 description: Array of product variants
 *                 items:
 *                   type: object
 *                   required:
 *                     - inv_var_sku
 *                   properties:
 *                     inv_var_sku:
 *                       type: string
 *                       description: Variant SKU
 *                       example: SKU-001
 *                     inv_var_status:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Variant status (0=inactive, 1=active)
 *                       example: 1
 *                     attr_values:
 *                       type: array
 *                       description: Array of attribute value IDs
 *                       items:
 *                         type: integer
 *                         minimum: 1
 *                       example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Inventory created successfully
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
 *                     inv_id:
 *                       type: integer
 *                       example: 1
 *                     inv_code:
 *                       type: string
 *                       example: INV-001
 *                     inv_description:
 *                       type: string
 *                       example: Product description
 *                     inv_status:
 *                       type: integer
 *                       example: 1
 *                     id_inv_family:
 *                       type: integer
 *                       example: 1
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *                   example: Inventory created successfully
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
 *                         example: inv_code
 *                       message:
 *                         type: string
 *                         example: inv_code is required
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
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_code")
            .notEmpty().isString().withMessage("inv_code is required"),
        body("id_inv_family")
            .notEmpty().withMessage("id_inv_family is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id_inv_family")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id_inv_family must be a number, not a string");
                }
                return true;
            }),
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_description_detail")
            .optional().isString().withMessage("inv_description_detail must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }

                    if ("attr_values" in variant) {
                        if (
                            !Array.isArray(variant.attr_values) ||
                            variant.attr_values.length === 0
                        ) {
                            throw new Error("Each variant must have a non-empty attr_values array");
                        }
                        for (const id of variant.attr_values) {
                            if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                                throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                            }
                        }
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryController.create
);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   put:
 *     summary: Update an inventory item (full update)
 *     description: Updates an existing inventory item with all fields
 *     tags: [inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_description:
 *                 type: string
 *                 description: Inventory description
 *               inv_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *               inv_type:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: Type (1=product, 2=service)
 *               inv_has_variants:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Has variants (0=no, 1=yes)
 *               inv_is_exempt:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is tax exempt (0=no, 1=yes)
 *               inv_is_stockable:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is stockable (0=no, 1=yes)
 *               inv_is_lot_managed:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is lot managed (0=no, 1=yes)
 *               inv_brand:
 *                 type: string
 *                 description: Brand name
 *               inv_model:
 *                 type: string
 *                 description: Model name
 *               inv_url_image:
 *                 type: string
 *                 description: URL to product image
 *               taxes:
 *                 type: array
 *                 description: Array of tax IDs
 *                 items:
 *                   type: integer
 *               variants:
 *                 type: array
 *                 description: Array of product variants
 *                 items:
 *                   type: object
 *                   required:
 *                     - inv_var_sku
 *                   properties:
 *                     inv_var_sku:
 *                       type: string
 *                       description: Variant SKU
 *                     inv_var_status:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Variant status (0=inactive, 1=active)
 *                     attr_values:
 *                       type: array
 *                       description: Array of attribute value IDs
 *                       items:
 *                         type: integer
 *                         minimum: 1
 *     responses:
 *       200:
 *         description: Inventory updated successfully
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
 *                     inv_id:
 *                       type: integer
 *                       example: 1
 *                     inv_code:
 *                       type: string
 *                       example: INV-001
 *                     inv_description:
 *                       type: string
 *                       example: Updated product description
 *                     inv_status:
 *                       type: integer
 *                       example: 1
 *                     inv_type:
 *                       type: integer
 *                       example: 1
 *                     inv_has_variants:
 *                       type: integer
 *                       example: 1
 *                     id_inv_family:
 *                       type: integer
 *                       example: 1
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *                   example: Inventory updated successfully
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
 *                         example: inv_status
 *                       message:
 *                         type: string
 *                         example: inv_status must be 0 or 1
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
 *       404:
 *         description: Inventory not found
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
 *                   example: Inventory not found
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }

                    if ("attr_values" in variant) {
                        if (
                            !Array.isArray(variant.attr_values) ||
                            variant.attr_values.length === 0
                        ) {
                            throw new Error("Each variant must have a non-empty attr_values array");
                        }
                        for (const id of variant.attr_values) {
                            if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                                throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                            }
                        }
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

/**
 * @swagger
 * /api/v1/inventory/{id}:
 *   patch:
 *     summary: Update an inventory item (partial update)
 *     description: Partially updates an existing inventory item
 *     tags: [inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_description:
 *                 type: string
 *                 description: Inventory description
 *               inv_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *               inv_type:
 *                 type: integer
 *                 enum: [1, 2]
 *                 description: Type (1=product, 2=service)
 *               inv_has_variants:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Has variants (0=no, 1=yes)
 *               inv_is_exempt:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is tax exempt (0=no, 1=yes)
 *               inv_is_stockable:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is stockable (0=no, 1=yes)
 *               inv_is_lot_managed:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Is lot managed (0=no, 1=yes)
 *               inv_brand:
 *                 type: string
 *                 description: Brand name
 *               inv_model:
 *                 type: string
 *                 description: Model name
 *               inv_url_image:
 *                 type: string
 *                 description: URL to product image
 *               taxes:
 *                 type: array
 *                 description: Array of tax IDs
 *                 items:
 *                   type: integer
 *               variants:
 *                 type: array
 *                 description: Array of product variants
 *                 items:
 *                   type: object
 *                   required:
 *                     - inv_var_sku
 *                   properties:
 *                     inv_var_sku:
 *                       type: string
 *                       description: Variant SKU
 *                     inv_var_status:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Variant status (0=inactive, 1=active)
 *                     attr_values:
 *                       type: array
 *                       description: Array of attribute value IDs
 *                       items:
 *                         type: integer
 *                         minimum: 1
 *     responses:
 *       200:
 *         description: Inventory updated successfully
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
 *                     inv_id:
 *                       type: integer
 *                       example: 1
 *                     inv_code:
 *                       type: string
 *                       example: INV-001
 *                     inv_description:
 *                       type: string
 *                       example: Partially updated description
 *                     inv_status:
 *                       type: integer
 *                       example: 1
 *                     inv_type:
 *                       type: integer
 *                       example: 1
 *                     id_inv_family:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Inventory updated successfully
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
 *                         example: inv_type
 *                       message:
 *                         type: string
 *                         example: inv_type must be 1 (product) or 2 (service)
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
 *       404:
 *         description: Inventory not found
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
 *                   example: Inventory not found
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }

                    if ("attr_values" in variant) {
                        if (
                            !Array.isArray(variant.attr_values) ||
                            variant.attr_values.length === 0
                        ) {
                            throw new Error("Each variant must have a non-empty attr_values array");
                        }
                        for (const id of variant.attr_values) {
                            if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                                throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                            }
                        }
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

export default router;