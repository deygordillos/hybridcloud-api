import { Router } from 'express'
import { body, param, query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { UsersController } from '../../controllers/users.controller';

const router = Router();

/**
 * @swagger
 * /v1/users:
 *   get:
 *     summary: List all users with pagination
 *     description: Retrieves a paginated list of users with optional filtering (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-company-id
 *         schema:
 *           type: integer
 *         required: false
 *         description: Company ID to filter users (if not provided, uses authenticated user's company)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: user_status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by user status (0=inactive, 1=active)
 *       - in: query
 *         name: user_type
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *         description: Filter by user type (1=API, 2=Web, 3=POS, 4=App)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       user_type:
 *                         type: integer
 *                         example: 2
 *                       user_status:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: john.doe@example.com
 *                       first_name:
 *                         type: string
 *                         example: John
 *                       last_name:
 *                         type: string
 *                         example: Doe
 *                       user_phone:
 *                         type: string
 *                         example: +1234567890
 *                       is_admin:
 *                         type: integer
 *                         example: 0
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       last_login:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     lastPage:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/',
    [
        authMiddleware,
        companyMiddleware,
        adminMiddleware,
        query('page').optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        query('user_status').optional().isInt().isIn([0, 1]).withMessage("User status must be 0 or 1"),
        query('user_type').optional().isInt().isIn([1, 2, 3, 4]).withMessage("User type must be 1, 2, 3, or 4"),
        validatorRequestMiddleware,
    ],
    UsersController.list);

/**
 * @swagger
 * /v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves detailed information of a specific user (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                     user_id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     user_type:
 *                       type: integer
 *                     user_status:
 *                       type: integer
 *                     is_admin:
 *                       type: integer
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        validatorRequestMiddleware,
    ],
    UsersController.getById);

/**
 * @swagger
 * /v1/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with full details and audit tracking (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - user_type
 *               - email
 *               - first_name
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123
 *                 description: Must contain at least one uppercase, one lowercase, and one number
 *               user_type:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 example: 2
 *                 description: 1=API user, 2=Web user, 3=POS user, 4=App user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: John
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Doe
 *               user_phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: +1234567890
 *               is_admin:
 *                 type: integer
 *                 enum: [0, 1]
 *                 default: 0
 *                 example: 0
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or user/email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/',
    [
        authMiddleware,
        adminMiddleware,
        body('username')
            .notEmpty().withMessage("Username is required")
            .trim()
            .isLength({ min: 3, max: 100 }).withMessage("Username must be between 3 and 100 characters"),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim()
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/).withMessage("Password must contain at least one number"),
        body('user_type')
            .notEmpty().withMessage("User type is required")
            .isInt().isIn([1, 2, 3, 4]).withMessage("User type must be 1, 2, 3, or 4"),
        body('email')
            .notEmpty().withMessage("Email is required")
            .trim()
            .isEmail().withMessage("Invalid email format"),
        body('first_name')
            .notEmpty().withMessage("First name is required")
            .trim()
            .isLength({ max: 50 }).withMessage("First name must be 50 characters or less"),
        body('last_name')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage("Last name must be 50 characters or less"),
        body('user_phone')
            .optional()
            .trim()
            .isLength({ max: 20 }).withMessage("Phone must be 20 characters or less"),
        body('is_admin')
            .optional()
            .isInt().isIn([0, 1]).withMessage("is_admin must be 0 or 1"),
        validatorRequestMiddleware,
    ],
    UsersController.create);

/**
 * @swagger
 * /v1/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Updates user information with audit tracking (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *               user_phone:
 *                 type: string
 *                 maxLength: 20
 *               user_type:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *               is_admin:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or email already exists
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage("Invalid email format"),
        body('first_name')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage("First name must be 50 characters or less"),
        body('last_name')
            .optional()
            .trim()
            .isLength({ max: 50 }).withMessage("Last name must be 50 characters or less"),
        body('user_phone')
            .optional()
            .trim()
            .isLength({ max: 20 }).withMessage("Phone must be 20 characters or less"),
        body('user_type')
            .optional()
            .isInt().isIn([1, 2, 3, 4]).withMessage("User type must be 1, 2, 3, or 4"),
        body('is_admin')
            .optional()
            .isInt().isIn([0, 1]).withMessage("is_admin must be 0 or 1"),
        validatorRequestMiddleware,
    ],
    UsersController.update);

/**
 * @swagger
 * /v1/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate a user
 *     description: Sets user status to inactive without deleting (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: User is already inactive
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/deactivate',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        validatorRequestMiddleware,
    ],
    UsersController.deactivate);

/**
 * @swagger
 * /v1/users/{id}/activate:
 *   post:
 *     summary: Activate a user
 *     description: Sets user status to active (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated successfully
 *       400:
 *         description: User is already active
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/activate',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        validatorRequestMiddleware,
    ],
    UsersController.activate);

/**
 * @swagger
 * /v1/users/{id}/change-password:
 *   post:
 *     summary: Change user password
 *     description: Changes a user's password with audit tracking (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewSecurePass123
 *                 description: Must contain at least one uppercase, one lowercase, and one number
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password format
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/:id/change-password',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim()
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/).withMessage("Password must contain at least one number"),
        validatorRequestMiddleware,
    ],
    UsersController.changePassword);

/**
 * @swagger
 * /v1/users/{id}/audit-history:
 *   get:
 *     summary: Get user audit history
 *     description: Retrieves the complete audit trail of changes made to a user (Admin only)
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of audit records per page
 *     responses:
 *       200:
 *         description: Audit history retrieved successfully
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
 *                       audit_id:
 *                         type: integer
 *                       action_type:
 *                         type: string
 *                         enum: [CREATE, UPDATE, DEACTIVATE, ACTIVATE, PASSWORD_CHANGE]
 *                       changes_data:
 *                         type: object
 *                       ip_address:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       changed_by:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                 pagination:
 *                   type: object
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id/audit-history',
    [
        authMiddleware,
        adminMiddleware,
        param('id').isInt().withMessage("User ID must be an integer"),
        query('page').optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
        validatorRequestMiddleware,
    ],
    UsersController.getAuditHistory);

/**
 * @swagger
 * /v1/users/{id}:
 *   delete:
 *     summary: Delete user (Not Allowed)
 *     description: This endpoint is blocked - users cannot be deleted, only deactivated
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       403:
 *         description: Forbidden - Deletion not allowed
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
 *                   example: Cannot delete users. Use deactivate instead.
 */
router.delete('/:id',
    [authMiddleware, adminMiddleware],
    (req, res) => {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete users. Use deactivate instead.'
        });
    });

export default router