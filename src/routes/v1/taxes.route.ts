import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { TaxesController } from '../../controllers/taxes.controller';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

// Enum para tax_type
export enum TaxTypeEnum {
    EXCENT = 1,
    PERCENT = 2,
    FIXED = 3
}

const router = Router();

/**
 * @swagger
 * /api/v1/taxes:
 *   get:
 *     summary: Get all taxes for the company
 *     description: Retrieves all tax configurations for the authenticated company
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Taxes retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    TaxesController.getTaxesByCompany);

/**
 * @swagger
 * /api/v1/taxes:
 *   post:
 *     summary: Create a new tax
 *     description: Creates a new tax configuration for the company
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tax_code
 *               - tax_name
 *               - tax_type
 *               - tax_value
 *             properties:
 *               tax_code:
 *                 type: string
 *                 description: Tax code
 *                 example: IVA
 *               tax_name:
 *                 type: string
 *                 description: Tax name
 *                 example: Value Added Tax
 *               tax_description:
 *                 type: string
 *                 description: Tax description
 *                 example: Standard VAT rate
 *               tax_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Tax type (1=exempt, 2=percent, 3=fixed)
 *                 example: 2
 *               tax_value:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Tax value
 *                 example: 16.0
 *     responses:
 *       201:
 *         description: Tax created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_code')
            .notEmpty().trim().isString().withMessage("You must send a tax_code"),
        body('tax_name')
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description')
            .optional().trim().isString().withMessage("tax_description must be a string"),
        body('tax_type')
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value')
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.create);

/**
 * @swagger
 * /api/v1/taxes/{id}:
 *   put:
 *     summary: Update a tax (full update)
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tax
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tax_name
 *               - tax_type
 *               - tax_value
 *             properties:
 *               tax_name:
 *                 type: string
 *               tax_description:
 *                 type: string
 *               tax_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Tax type (1=exempt, 2=percent, 3=fixed)
 *               tax_value:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Tax updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax not found
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_name')
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description').optional()
            .trim().isString().withMessage("tax_description must be a string"),
        body('tax_type')
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value')
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.update);

/**
 * @swagger
 * /api/v1/taxes/{id}:
 *   patch:
 *     summary: Update a tax (partial update)
 *     tags: [Taxes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tax
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tax_name:
 *                 type: string
 *               tax_description:
 *                 type: string
 *               tax_type:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: Tax type (1=exempt, 2=percent, 3=fixed)
 *               tax_value:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Tax updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax not found
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_name').optional()
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description').optional()
            .trim().isString().withMessage("tax_description must be a string"),
        body('tax_type').optional()
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value').optional()
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.update);

export default router