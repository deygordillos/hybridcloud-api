import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryFamilyController } from '../../controllers/inventoryFamily.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/inventory/family:
 *   get:
 *     summary: Get all inventory families for the company
 *     description: Retrieves all inventory family configurations for the authenticated company
 *     tags: [Inventory Family]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory families retrieved successfully
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
 *                       inv_family_id:
 *                         type: integer
 *                         example: 1
 *                       inv_family_code:
 *                         type: string
 *                         example: FAM001
 *                       inv_family_name:
 *                         type: string
 *                         example: Electronics
 *                       inv_family_status:
 *                         type: integer
 *                         example: 1
 *                       inv_is_stockable:
 *                         type: integer
 *                         example: 1
 *                       inv_is_lot_managed:
 *                         type: integer
 *                         example: 0
 *                       tax_id:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Inventory families retrieved successfully
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
    InventoryFamilyController.getInventoryFamiliesByCompany);

/**
 * @swagger
 * /api/v1/inventory/family:
 *   post:
 *     summary: Create a new inventory family
 *     description: Creates a new inventory family with product configuration settings
 *     tags: [Inventory Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inv_family_code
 *               - inv_family_name
 *             properties:
 *               inv_family_code:
 *                 type: string
 *                 description: Family code
 *                 example: FAM001
 *               inv_family_name:
 *                 type: string
 *                 maxLength: 80
 *                 description: Family name
 *                 example: Electronics
 *               inv_family_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
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
 *               tax_id:
 *                 type: integer
 *                 description: Tax ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: Inventory family created successfully
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
 *                     inv_family_id:
 *                       type: integer
 *                       example: 1
 *                     inv_family_code:
 *                       type: string
 *                       example: FAM001
 *                     inv_family_name:
 *                       type: string
 *                       example: Electronics
 *                     inv_family_status:
 *                       type: integer
 *                       example: 1
 *                     inv_is_stockable:
 *                       type: integer
 *                       example: 1
 *                     inv_is_lot_managed:
 *                       type: integer
 *                       example: 0
 *                     tax_id:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Inventory family created successfully
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: inv_family_code
 *                       message:
 *                         type: string
 *                         example: inv_family_code is required
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
        body("inv_family_code").notEmpty().isString().withMessage("inv_family_code is required"),
        body("inv_family_name").notEmpty().isString().withMessage("inv_family_code is required")
            .isLength({ max: 80 }).withMessage("inv_family_code must be a string (max 80 chars)"),
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        body('tax_id').optional()
            .isInt().withMessage("You must send a valid tax_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_id must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.create);

/**
 * @swagger
 * /api/v1/inventory/family/{id}:
 *   put:
 *     summary: Update an inventory family (full update)
 *     tags: [Inventory Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the inventory family
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_family_status:
 *                 type: integer
 *                 enum: [0, 1]
 *               inv_is_stockable:
 *                 type: integer
 *                 enum: [0, 1]
 *               inv_is_lot_managed:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Inventory family updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Inventory family not found
 */
router.put('/:id', 
    [
        authMiddleware,
        companyMiddleware,
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.update);

/**
 * @swagger
 * /api/v1/inventory/family/{id}:
 *   patch:
 *     summary: Update an inventory family (partial update)
 *     tags: [Inventory Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the inventory family
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_family_status:
 *                 type: integer
 *                 enum: [0, 1]
 *               inv_is_stockable:
 *                 type: integer
 *                 enum: [0, 1]
 *               inv_is_lot_managed:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Inventory family updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Inventory family not found
 */
router.patch('/:id', 
    [
        authMiddleware,
        companyMiddleware,
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.update);
export default router