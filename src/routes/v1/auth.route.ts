import { Router } from 'express'
import { body } from "express-validator";
import { AuthController } from '../../controllers/auth.controller';
import { validatorRequestMiddleware } from '../../middlewares/validator_request';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns access and refresh tokens
 *     tags: [Authentication]
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
 *                 refresh_token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
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
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token
 *     tags: [Authentication]
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
 *       400:
 *         description: Invalid or missing refresh token
 *       401:
 *         description: Token expired or invalid
 */
router.post('/refresh', 
    [
        body('refresh_token').notEmpty().withMessage("Access Denied. No refresh token provided").trim(),
        validatorRequestMiddleware
    ],
    AuthController.refreshLogin);

export default router