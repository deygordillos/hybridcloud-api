import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { CustomersController } from '../../controllers/customers.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get all customers for the company
 *     description: Retrieves all customers associated with the authenticated company
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.getCustomersByCompany);

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Create a new customer
 *     description: Creates a new customer for the authenticated company
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cust_code
 *               - cust_id_fiscal
 *               - cust_description
 *             properties:
 *               cust_code:
 *                 type: string
 *                 description: Customer code
 *                 example: CUST001
 *               cust_id_fiscal:
 *                 type: string
 *                 maxLength: 30
 *                 description: Fiscal/Tax ID
 *                 example: J-123456789
 *               cust_description:
 *                 type: string
 *                 maxLength: 150
 *                 description: Customer description/name
 *                 example: Customer Name Corp
 *               cust_email:
 *                 type: string
 *                 format: email
 *                 description: Customer email
 *                 example: customer@example.com
 *               cust_telephone1:
 *                 type: string
 *                 maxLength: 20
 *                 description: Primary phone number
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("cust_code").notEmpty().isString().withMessage("cust_code is required"),
        body("cust_id_fiscal").notEmpty().isString().withMessage("cust_id_fiscal is required")
            .isLength({ max: 30 }).withMessage("cust_id_fiscal must be a string (max 30 chars)"),
        body("cust_description").notEmpty().isString().withMessage("cust_description is required")
            .isLength({ max: 150 }).withMessage("cust_description must be a string (max 150 chars)"),
        body("cust_email").optional().isEmail().withMessage("Invalid email format"),
        body("cust_telephone1").optional().isString().isLength({ max: 20 }).withMessage("cust_telephone1 must be a string (max 20 chars)"),
        validatorRequestMiddleware
    ],
    CustomersController.create);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Update a customer (full update)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cust_code:
 *                 type: string
 *               cust_id_fiscal:
 *                 type: string
 *                 maxLength: 30
 *               cust_description:
 *                 type: string
 *                 maxLength: 150
 *               cust_email:
 *                 type: string
 *                 format: email
 *               cust_telephone1:
 *                 type: string
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.put('/:id', 
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.update);

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   patch:
 *     summary: Update a customer (partial update)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cust_code:
 *                 type: string
 *               cust_id_fiscal:
 *                 type: string
 *                 maxLength: 30
 *               cust_description:
 *                 type: string
 *                 maxLength: 150
 *               cust_email:
 *                 type: string
 *                 format: email
 *               cust_telephone1:
 *                 type: string
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */
router.patch('/:id', 
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.update);
export default router