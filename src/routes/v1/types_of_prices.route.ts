import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { TypesOfPricesController } from '../../controllers/types_of_prices.controller';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();

/**
 * @swagger
 * /api/v1/types-of-prices:
 *   get:
 *     summary: Get all price types for the company
 *     description: Retrieves all price type configurations for the authenticated company
 *     tags: [types-of-prices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Price types retrieved successfully
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
 *                       typeprice_id:
 *                         type: integer
 *                         example: 1
 *                       typeprice_name:
 *                         type: string
 *                         example: Retail
 *                       typeprice_description:
 *                         type: string
 *                         example: Standard retail price
 *                       typeprice_status:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Price types retrieved successfully
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
    TypesOfPricesController.getAllByCompany
);

/**
 * @swagger
 * /api/v1/types-of-prices:
 *   post:
 *     summary: Create a new price type
 *     description: Creates a new price type configuration for the company
 *     tags: [types-of-prices]
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
 *                     typeprice_id:
 *                       type: integer
 *                       example: 1
 *                     typeprice_name:
 *                       type: string
 *                       example: Retail
 *                     typeprice_description:
 *                       type: string
 *                       example: Standard retail price
 *                     typeprice_status:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Price type created successfully
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
 *                         example: typeprice_name
 *                       message:
 *                         type: string
 *                         example: You must send a typeprice_name
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
 * /api/v1/types-of-prices/{id}:
 *   put:
 *     summary: Update a price type (full update)
 *     tags: [types-of-prices]
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
 * /api/v1/types-of-prices/{id}:
 *   patch:
 *     summary: Update a price type (partial update)
 *     tags: [types-of-prices]
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