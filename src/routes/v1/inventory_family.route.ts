import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryFamilyController } from '../../controllers/inventoryFamily.controller';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryFamilyController.getInventoryFamiliesByCompany);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_family_code").notEmpty().isString().withMessage("inv_family_code is required"),
        body("inv_family_name").notEmpty().isString().withMessage("inv_family_code is required")
            .isLength({ max: 20 }).withMessage("inv_family_code must be a string (max 20 chars)"),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.create);

router.put('/:id', 
    [
        authMiddleware,
        companyMiddleware,
    ],
    InventoryFamilyController.update);

router.patch('/:id', 
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryFamilyController.update);
export default router