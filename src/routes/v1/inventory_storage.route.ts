import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryStorageController } from '../../controllers/inventoryStorage.controller';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryStorageController.getInventoryStoragesByCompany
);

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

router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
    ],
    InventoryStorageController.update
);

router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryStorageController.update
);

export default router;