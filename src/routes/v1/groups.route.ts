import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { GroupController } from '../../controllers/groups.controller';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = Router();

/**
 * @swagger
 * /api/v1/groups:
 *   get:
 *     summary: Get all groups
 *     description: Retrieves all groups (Admin only)
 *     tags: [groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
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
 *                       group_id:
 *                         type: integer
 *                         example: 1
 *                       group_name:
 *                         type: string
 *                         example: Enterprise Group
 *                       group_status:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Groups retrieved successfully
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
        adminMiddleware
    ],
    GroupController.list);

/**
 * @swagger
 * /api/v1/groups:
 *   post:
 *     summary: Create a new group
 *     description: Creates a new group (Admin only)
 *     tags: [groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *             properties:
 *               group_name:
 *                 type: string
 *                 description: Group name
 *                 example: Enterprise Group
 *     responses:
 *       201:
 *         description: Group created successfully
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
 *                     group_id:
 *                       type: integer
 *                       example: 1
 *                     group_name:
 *                       type: string
 *                       example: Enterprise Group
 *                     group_status:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Group created successfully
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
 *                         example: group_name
 *                       message:
 *                         type: string
 *                         example: You must send a group name
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
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware
    ],
    GroupController.create);

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   put:
 *     summary: Update a group (full update)
 *     description: Updates all fields of an existing group (Admin only)
 *     tags: [groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *             properties:
 *               group_name:
 *                 type: string
 *                 description: Group name
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Group not found
 */
router.put('/:id', 
    [
        authMiddleware,
        adminMiddleware,
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware,
    ],
    GroupController.update);

/**
 * @swagger
 * /api/v1/groups/{id}:
 *   patch:
 *     summary: Update a group (partial update)
 *     description: Partially updates an existing group (Admin only)
 *     tags: [groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group_name
 *             properties:
 *               group_name:
 *                 type: string
 *                 description: Group name
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Group not found
 */
router.patch('/:id', 
    [
        authMiddleware,
        adminMiddleware,
        body('group_name').notEmpty().trim().withMessage("You must send a group name"),
        validatorRequestMiddleware,
    ],
    GroupController.update);
export default router