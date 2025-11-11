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
 *     tags: [Inventory Storage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage locations retrieved successfully
 *       401:
 *         description: Unauthorized
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
 *     tags: [Inventory Storage]
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
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
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
 *     tags: [Inventory Storage]
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
 *     tags: [Inventory Storage]
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