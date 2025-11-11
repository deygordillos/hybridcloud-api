import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { TypesOfPricesController } from '../../controllers/types_of_prices.controller';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();

/**
 * @swagger
 * /api/v1/types_of_prices:
 *   get:
 *     summary: Get all price types for the company
 *     description: Retrieves all price type configurations for the authenticated company
 *     tags: [Types of Prices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Price types retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    TypesOfPricesController.getAllByCompany
);

/**
 * @swagger
 * /api/v1/types_of_prices:
 *   post:
 *     summary: Create a new price type
 *     description: Creates a new price type configuration for the company
 *     tags: [Types of Prices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - typeprice_name
 *               - typeprice_description
 *             properties:
 *               typeprice_name:
 *                 type: string
 *                 maxLength: 50
 *                 description: Price type name
 *                 example: Retail
 *               typeprice_description:
 *                 type: string
 *                 maxLength: 150
 *                 description: Price type description
 *                 example: Standard retail price
 *               typeprice_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Price type created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.create
);

/**
 * @swagger
 * /api/v1/types_of_prices/{id}:
 *   put:
 *     summary: Update a price type (full update)
 *     tags: [Types of Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the price type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeprice_name:
 *                 type: string
 *                 maxLength: 50
 *               typeprice_description:
 *                 type: string
 *                 maxLength: 150
 *               typeprice_status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Price type updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Price type not found
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.update
);

/**
 * @swagger
 * /api/v1/types_of_prices/{id}:
 *   patch:
 *     summary: Update a price type (partial update)
 *     tags: [Types of Prices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the price type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeprice_name:
 *                 type: string
 *                 maxLength: 50
 *               typeprice_description:
 *                 type: string
 *                 maxLength: 150
 *               typeprice_status:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: Price type updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Price type not found
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.update
);

export default router