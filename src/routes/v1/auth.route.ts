import { Router } from 'express'
import { body } from "express-validator";
import { AuthController } from '../../controllers/auth.controller';
import { validatorRequestMiddleware } from '../../middlewares/validator_request';

const router = Router();

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns access and refresh tokens
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: MyPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 access_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU4NzYwMCwiZXhwIjoxNjM5NTkxMjAwfQ.xyz
 *                 refresh_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU4NzYwMCwiZXhwIjoxNjQwMTkyNDAwfQ.abc
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: admin
 *                     user_email:
 *                       type: string
 *                       example: admin@example.com
 *       400:
 *         description: Invalid credentials or validation error
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
 *                   example: Invalid username or password
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
router.post('/login', 
    [
        body('username').notEmpty().withMessage("You must send a username").trim(),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim(),
        validatorRequestMiddleware
    ],
    AuthController.login);

/**
 * @swagger
 * /v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 access_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYzOTU4NzYwMCwiZXhwIjoxNjM5NTkxMjAwfQ.newtoken
 *       400:
 *         description: Invalid or missing refresh token
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
 *                   example: Refresh token is required
 *       401:
 *         description: Token expired or invalid
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
 *                   example: Invalid or expired refresh token
 */
router.post('/refresh', 
    [
        body('refresh_token').notEmpty().withMessage("Access Denied. No refresh token provided").trim(),
        validatorRequestMiddleware
    ],
    AuthController.refreshLogin);

/**
 * @swagger
 * /v1/auth/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset token to the user's email
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset token sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset instructions have been sent to your email
 *                 token:
 *                   type: string
 *                   description: Reset token (only in development mode)
 *                   example: a1b2c3d4e5f6...
 *       400:
 *         description: Invalid email or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No user found with this email address
 */
router.post('/request-password-reset', 
    [
        body('email')
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email format")
            .trim(),
        validatorRequestMiddleware
    ],
    AuthController.requestPasswordReset);

/**
 * @swagger
 * /v1/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets the user's password using a valid reset token
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Valid reset token received via email
 *                 example: a1b2c3d4e5f6...
 *               new_password:
 *                 type: string
 *                 format: password
 *                 description: New password (min 8 chars, uppercase, lowercase, number)
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been reset successfully
 *       400:
 *         description: Invalid or expired token, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired reset token
 */
router.post('/reset-password', 
    [
        body('token')
            .notEmpty().withMessage("Reset token is required")
            .trim(),
        body('new_password')
            .notEmpty().withMessage("New password is required")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/).withMessage("Password must contain at least one number")
            .trim(),
        validatorRequestMiddleware
    ],
    AuthController.resetPassword);

export default router