import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { CompaniesController } from '../../controllers/companies.controller';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { AuthController } from '../../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /v1/companies:
 *   get:
 *     summary: List all companies
 *     description: Retrieves a list of all companies (Admin only)
 *     tags: [companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
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
 *                       company_id:
 *                         type: integer
 *                         example: 1
 *                       group_id:
 *                         type: integer
 *                         example: 1
 *                       company_is_principal:
 *                         type: boolean
 *                         example: true
 *                       company_name:
 *                         type: string
 *                         example: Acme Corporation
 *                       company_razon_social:
 *                         type: string
 *                         example: Acme Corporation S.A.
 *                       company_id_fiscal:
 *                         type: string
 *                         example: J-123456789
 *                       company_email:
 *                         type: string
 *                         example: info@acme.com
 *                       company_phone1:
 *                         type: string
 *                         example: +1234567890
 *                       company_start:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-01T00:00:00.000Z"
 *                       company_end:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-01T00:00:00.000Z"
 *                       country_id:
 *                         type: integer
 *                         example: 1
 *                       admin_users:
 *                         type: array
 *                         description: List of admin users assigned to this company
 *                         items:
 *                           type: object
 *                           properties:
 *                             user_id:
 *                               type: integer
 *                               example: 5
 *                             username:
 *                               type: string
 *                               example: johndoe
 *                             email:
 *                               type: string
 *                               example: john.doe@acme.com
 *                             first_name:
 *                               type: string
 *                               example: John
 *                             last_name:
 *                               type: string
 *                               example: Doe
 *                             is_company_admin:
 *                               type: integer
 *                               example: 1
 *                             assigned_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-01-15T10:30:00.000Z"
 *                 message:
 *                   type: string
 *                   example: Companies retrieved successfully
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
 *         description: Forbidden - Admin access required
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
 *                   example: Admin access required
 */
router.get('/',
    [
        authMiddleware,
        adminMiddleware,
    ],
    CompaniesController.list);

/**
 * @swagger
 * /v1/companies:
 *   post:
 *     summary: Create a new company
 *     description: Creates a new company with all required information (Admin only)
 *     tags: [companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_id
 *               - company_is_principal
 *               - company_name
 *               - company_razon_social
 *               - company_id_fiscal
 *               - company_email
 *               - company_phone1
 *               - company_start
 *               - company_end
 *               - country_id
 *             properties:
 *               group_id:
 *                 type: integer
 *                 description: ID of the group this company belongs to
 *                 example: 1
 *               company_is_principal:
 *                 type: boolean
 *                 description: Whether this is a principal company
 *                 example: true
 *               company_name:
 *                 type: string
 *                 description: Company name
 *                 example: Acme Corporation
 *               company_razon_social:
 *                 type: string
 *                 description: Business/legal name
 *                 example: Acme Corporation S.A.
 *               company_id_fiscal:
 *                 type: string
 *                 description: Fiscal/Tax ID
 *                 example: J-123456789
 *               company_email:
 *                 type: string
 *                 format: email
 *                 description: Company email
 *                 example: info@acme.com
 *               company_phone1:
 *                 type: string
 *                 description: Primary phone number
 *                 example: +1234567890
 *               company_start:
 *                 type: string
 *                 format: date-time
 *                 description: License start date (ISO8601)
 *                 example: 2025-01-01T00:00:00.000Z
 *               company_end:
 *                 type: string
 *                 format: date-time
 *                 description: License end date (must be after start date)
 *                 example: 2026-01-01T00:00:00.000Z
 *               country_id:
 *                 type: integer
 *                 description: Country ID
 *                 example: 1
 *     responses:
 *       201:
 *         description: Company created successfully
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
 *                     company_id:
 *                       type: integer
 *                       example: 1
 *                     group_id:
 *                       type: integer
 *                       example: 1
 *                     company_is_principal:
 *                       type: boolean
 *                       example: true
 *                     company_name:
 *                       type: string
 *                       example: Acme Corporation
 *                     company_razon_social:
 *                       type: string
 *                       example: Acme Corporation S.A.
 *                     company_id_fiscal:
 *                       type: string
 *                       example: J-123456789
 *                     company_email:
 *                       type: string
 *                       example: info@acme.com
 *                     company_phone1:
 *                       type: string
 *                       example: +1234567890
 *                     company_start:
 *                       type: string
 *                       example: "2025-01-01T00:00:00.000Z"
 *                     company_end:
 *                       type: string
 *                       example: "2026-01-01T00:00:00.000Z"
 *                     country_id:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Company created successfully
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
 *                         example: company_email
 *                       message:
 *                         type: string
 *                         example: You must send a company email
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
 *         description: Forbidden - Admin access required
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
 *                   example: Admin access required
 */
router.post('/',
    [
        authMiddleware,
        adminMiddleware,
        body('group_id')
            .isInt()
            .custom((value) => {
                if (typeof value !== 'number') {
                    throw new Error("You must send a group_id as numeric");
                }
                return true;
            }),
        body('company_is_principal').notEmpty().trim().isBoolean().withMessage("You must send if is a principal company"),
        body('company_name').notEmpty().trim().withMessage("You must send a company name"),
        body('company_razon_social').notEmpty().trim().withMessage("You must send a business name"),
        body('company_id_fiscal').notEmpty().trim().withMessage("You must send a fiscal id"),
        body('company_email').notEmpty().trim().withMessage("You must send a company email"),
        body('company_phone1').notEmpty().trim().withMessage("You must send a company phone1"),
        body('company_start').notEmpty().withMessage("You must send a licence start").trim()
            .isISO8601().withMessage("Licence start must be a valid date in ISO8601 format")
            .toDate(),
        body('company_end').notEmpty().withMessage("You must send a licence end").trim()
            .isISO8601().withMessage("Licence end must be a valid date in ISO8601 format")
            .toDate().custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.company_start)) {
                throw new Error("Licence end must be after licence start");
            }
            return true;
        }),
        body('country_id')
            .isInt()
            .custom((value) => {
                if (typeof value !== 'number') {
                    throw new Error("You must send a country_id as numeric");
                }
                return true;
            }),
        validatorRequestMiddleware,
    ],
    CompaniesController.create);

/**
 * @swagger
 * /v1/companies/{id}:
 *   put:
 *     summary: Update a company (full update)
 *     description: Updates all fields of an existing company (Admin only)
 *     tags: [companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               company_is_principal:
 *                 type: boolean
 *               company_name:
 *                 type: string
 *               company_razon_social:
 *                 type: string
 *               company_id_fiscal:
 *                 type: string
 *               company_email:
 *                 type: string
 *                 format: email
 *               company_phone1:
 *                 type: string
 *               company_start:
 *                 type: string
 *                 format: date-time
 *               company_end:
 *                 type: string
 *                 format: date-time
 *               country_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Company not found
 */
router.put('/:id', 
    [
        authMiddleware, 
        adminMiddleware,
    ],
    CompaniesController.update);

/**
 * @swagger
 * /v1/companies/{id}:
 *   patch:
 *     summary: Update a company (partial update)
 *     description: Partially updates specific fields of an existing company (Admin only)
 *     tags: [companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               group_id:
 *                 type: integer
 *               company_is_principal:
 *                 type: boolean
 *               company_name:
 *                 type: string
 *               company_razon_social:
 *                 type: string
 *               company_id_fiscal:
 *                 type: string
 *               company_email:
 *                 type: string
 *                 format: email
 *               company_phone1:
 *                 type: string
 *               company_start:
 *                 type: string
 *                 format: date-time
 *               company_end:
 *                 type: string
 *                 format: date-time
 *               country_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Company not found
 */
router.patch('/:id', 
    [
        authMiddleware,
        adminMiddleware,
    ],
    CompaniesController.update);

/**
 * @swagger
 * /v1/companies/register_admin/{company_id}:
 *   post:
 *     summary: Register an admin for a company
 *     description: Creates a new admin user for a specific company (Admin only)
 *     tags: [companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - first_name
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the admin
 *                 example: companyadmin
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 8 chars, must contain uppercase, lowercase, and number)
 *                 example: Admin123
 *               first_name:
 *                 type: string
 *                 description: First name of the admin
 *                 example: John
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: admin@company.com
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input data or password does not meet requirements
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Company not found
 */
router.post('/register_admin/:company_id',
    [
        authMiddleware,
        adminMiddleware,
        body('username').notEmpty().withMessage("You must send a username").trim(),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim()
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/).withMessage("Password must contain at least one number"),
        body('first_name').notEmpty().withMessage("You must send a first name").trim(),
        body('email').notEmpty().withMessage("Email is required").trim().isEmail().withMessage("Invalid email format"),
        validatorRequestMiddleware,
    ],
    AuthController.registerAdminCompany);
// router.post('/migrate/:id',
//     authMiddleware, 
//     adminMiddleware,
//     migrateDatabase);

// router.post('/migrate/:id/revert',
//     authMiddleware, 
//     adminMiddleware,
//     revertMigrateDatabase);

export default router