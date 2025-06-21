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
            .isLength({ max: 80 }).withMessage("inv_family_code must be a string (max 80 chars)"),
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        body('tax_id').optional()
            .isInt().withMessage("You must send a valid tax_id")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_id must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.create);

router.put('/:id', 
    [
        authMiddleware,
        companyMiddleware,
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.update);

router.patch('/:id', 
    [
        authMiddleware,
        companyMiddleware,
        body('inv_family_status').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_family_status (1 active, 0 inactive)"),
        body('inv_is_stockable').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_stockable (1 yes, 0 no)"),
        body('inv_is_lot_managed').optional()
            .isInt().isIn([0, 1]).withMessage("You must send a inv_is_lot_managed (1 yes, 0 no)"),
        validatorRequestMiddleware
    ],
    InventoryFamilyController.update);
export default router