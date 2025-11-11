import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryStorageController } from '../../controllers/inventoryStorage.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/inventory/storage:
 *   get:
 *     summary: Get all inventory storage locations for the company
 *     description: Retrieves all storage locations configured for the authenticated company
 *     tags: [inventory-storage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage locations retrieved successfully
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
 *                       inv_sto_id:
 *                         type: integer
 *                         example: 1
 *                       inv_storage_code:
 *                         type: string
 *                         example: WH001
 *                       inv_storage_name:
 *                         type: string
 *                         example: Main Warehouse
 *                       inv_storage_status:
 *                         type: integer
 *                         example: 1
 *                 message:
 *                   type: string
 *                   example: Storage locations retrieved successfully
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
    InventoryStorageController.getInventoryStoragesByCompany
);

/**
 * @swagger
 * /api/v1/inventory/storage:
 *   post:
 *     summary: Create a new inventory storage location
 *     description: Creates a new storage location for inventory management
 *     tags: [inventory-storage]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inv_storage_code
 *               - inv_storage_name
 *             properties:
 *               inv_storage_code:
 *                 type: string
 *                 description: Storage code
 *                 example: WH001
 *               inv_storage_name:
 *                 type: string
 *                 maxLength: 80
 *                 description: Storage name
 *                 example: Main Warehouse
 *     responses:
 *       201:
 *         description: Storage location created successfully
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
 *                     inv_sto_id:
 *                       type: integer
 *                       example: 1
 *                     inv_storage_code:
 *                       type: string
 *                       example: WH001
 *                     inv_storage_name:
 *                       type: string
 *                       example: Main Warehouse
 *                     inv_storage_status:
 *                       type: integer
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: Storage location created successfully
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
 *                         example: inv_storage_code
 *                       message:
 *                         type: string
 *                         example: inv_storage_code is required
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
        body("inv_storage_code").notEmpty().isString().withMessage("inv_storage_code is required"),
        body("inv_storage_name").notEmpty().isString().withMessage("inv_storage_name is required")
            .isLength({ max: 80 }).withMessage("inv_storage_name must be a string (max 80 chars)"),
        validatorRequestMiddleware
    ],
    InventoryStorageController.create
);

/**
 * @swagger
 * /api/v1/inventory/storage/{id}:
 *   put:
 *     summary: Update a storage location (full update)
 *     tags: [inventory-storage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the storage location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_storage_code:
 *                 type: string
 *               inv_storage_name:
 *                 type: string
 *                 maxLength: 80
 *     responses:
 *       200:
 *         description: Storage location updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Storage location not found
 */
router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
    ],
    InventoryStorageController.update
);

/**
 * @swagger
 * /api/v1/inventory/storage/{id}:
 *   patch:
 *     summary: Update a storage location (partial update)
 *     tags: [inventory-storage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the storage location
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inv_storage_code:
 *                 type: string
 *               inv_storage_name:
 *                 type: string
 *                 maxLength: 80
 *     responses:
 *       200:
 *         description: Storage location updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Storage location not found
 */
router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryStorageController.update
);

export default router;