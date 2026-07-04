import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryAttributesController } from '../../controllers/inventory.attributes.controller';

const router = Router();

/**
 * @swagger
 * /v1/inventory/attributes:
 *   get:
 *     summary: Get all inventory attributes for the company
 *     description: Retrieves all inventory attributes with their values for the authenticated company
 *     tags: [inventory-attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
 *         description: Filter by status (0=inactive, 1=active)
 *     responses:
 *       200:
 *         description: Attributes found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attributes found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       inv_attr_id:
 *                         type: integer
 *                         example: 1
 *                       attr_name:
 *                         type: string
 *                         example: Color
 *                       attr_description:
 *                         type: string
 *                         example: Product color variations
 *                       attr_status:
 *                         type: integer
 *                         example: 1
 *                       attr_values:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             inv_attrval_id:
 *                               type: integer
 *                               example: 1
 *                             attr_value:
 *                               type: string
 *                               example: Red
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: Bad request
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
 *                   example: Company ID is required
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
router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryAttributesController.getAllByCompany
);

/**
 * @swagger
 * /v1/inventory/attributes:
 *   post:
 *     summary: Create a new inventory attribute
 *     description: Creates a new inventory attribute with optional predefined values
 *     tags: [inventory-attributes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attr_name
 *             properties:
 *               attr_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Attribute name
 *                 example: Color
 *               attr_description:
 *                 type: string
 *                 maxLength: 150
 *                 description: Attribute description
 *                 example: Product color variations
 *               attr_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *               attr_values:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of attribute values
 *                 items:
 *                   type: string
 *                 example: ["Red", "Blue", "Green"]
 *     responses:
 *       201:
 *         description: Attribute created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attribute created
 *                 data:
 *                   type: object
 *                   properties:
 *                     inv_attr_id:
 *                       type: integer
 *                       example: 1
 *                     attr_name:
 *                       type: string
 *                       example: Color
 *                     attr_description:
 *                       type: string
 *                       example: Product color variations
 *                     attr_status:
 *                       type: integer
 *                       example: 1
 *                     attr_values:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           inv_attrval_id:
 *                             type: integer
 *                             example: 1
 *                           attr_value:
 *                             type: string
 *                             example: Red
 *       400:
 *         description: Invalid input data
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
 *                   example: attr_name is required
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: attr_name
 *                       message:
 *                         type: string
 *                         example: attr_name is required
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
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.create
);

/**
 * @swagger
 * /v1/inventory/attributes/{id}:
 *   put:
 *     summary: Update an inventory attribute (full update)
 *     tags: [inventory-attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the attribute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attr_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Attribute name
 *                 example: Color
 *               attr_description:
 *                 type: string
 *                 maxLength: 150
 *                 description: Attribute description
 *                 example: Product color variations
 *               attr_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *               attr_values:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 description: Array of attribute values to add
 *                 example: ["Red", "Blue"]
 *     responses:
 *       200:
 *         description: Attribute updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attribute updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     inv_attr_id:
 *                       type: integer
 *                       example: 1
 *                     attr_name:
 *                       type: string
 *                       example: Color
 *                     attr_description:
 *                       type: string
 *                       example: Product color variations
 *                     attr_status:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid input data
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
 *                   example: Company ID is required
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
 *         description: Attribute not found
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
 *                   example: Attribute not found
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .optional().notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.update
);

/**
 * @swagger
 * /v1/inventory/attributes/{id}:
 *   patch:
 *     summary: Update an inventory attribute (partial update)
 *     tags: [inventory-attributes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the attribute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attr_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Attribute name
 *                 example: Color
 *               attr_description:
 *                 type: string
 *                 maxLength: 150
 *                 description: Attribute description
 *                 example: Product color variations
 *               attr_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *               attr_values:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 description: Array of attribute values to add
 *                 example: ["Red", "Blue"]
 *     responses:
 *       200:
 *         description: Attribute updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Attribute updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     inv_attr_id:
 *                       type: integer
 *                       example: 1
 *                     attr_name:
 *                       type: string
 *                       example: Color
 *                     attr_description:
 *                       type: string
 *                       example: Product color variations
 *                     attr_status:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid input data
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
 *                   example: Company ID is required
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
 *         description: Attribute not found
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
 *                   example: Attribute not found
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .optional().notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.update
);

export default router;