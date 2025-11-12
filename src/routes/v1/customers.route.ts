import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { CustomersController } from '../../controllers/customers.controller';

const router = Router();

/**
 * @swagger
 * /v1/customers:
 *   get:
 *     summary: Get all customers for the company
 *     description: Retrieves all customers associated with the authenticated company
 *     tags: [customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
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
 *                       cust_id:
 *                         type: integer
 *                         example: 1
 *                       cust_code:
 *                         type: string
 *                         example: CUST001
 *                       cust_id_fiscal:
 *                         type: string
 *                         example: J-123456789
 *                       cust_description:
 *                         type: string
 *                         example: Customer Name Corp
 *                       cust_email:
 *                         type: string
 *                         example: customer@example.com
 *                       cust_telephone1:
 *                         type: string
 *                         example: +1234567890
 *                       cust_status:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Customers retrieved successfully
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
    CustomersController.getCustomersByCompany);

/**
 * @swagger
 * /v1/customers:
 *   post:
 *     summary: Create a new customer
 *     description: Creates a new customer for the authenticated company
 *     tags: [customers]
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
 *                     cust_id:
 *                       type: integer
 *                       example: 1
 *                     cust_code:
 *                       type: string
 *                       example: CUST001
 *                     cust_id_fiscal:
 *                       type: string
 *                       example: J-123456789
 *                     cust_description:
 *                       type: string
 *                       example: Customer Name Corp
 *                     cust_email:
 *                       type: string
 *                       example: customer@example.com
 *                     cust_telephone1:
 *                       type: string
 *                       example: +1234567890
 *                     cust_status:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Customer created successfully
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
 *                         example: cust_code
 *                       message:
 *                         type: string
 *                         example: cust_code is required
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
 * /v1/customers/{id}:
 *   put:
 *     summary: Update a customer (full update)
 *     tags: [customers]
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
 * /v1/customers/{id}:
 *   patch:
 *     summary: Update a customer (partial update)
 *     tags: [customers]
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