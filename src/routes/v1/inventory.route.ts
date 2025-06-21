import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryController } from '../../controllers/inventory.controller';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryController.getInventoriesByCompany
);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_code")
            .notEmpty().isString().withMessage("inv_code is required"),
        body("id_inv_family")
            .notEmpty().withMessage("id_inv_family is required")
            .isInt({ min: 1 }).withMessage("You must send a valid id_inv_family")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id_inv_family must be a number, not a string");
                }
                return true;
            }),
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_description_detail")
            .optional().isString().withMessage("inv_description_detail must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        validatorRequestMiddleware
    ],
    InventoryController.create
);

router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("inv_description")
            .optional().isString().withMessage("inv_description must be a string"),
        body("inv_status")
            .optional().isInt().isIn([0, 1]).withMessage("inv_status must be 0 or 1"),
        body("inv_type")
            .optional().isInt().isIn([1, 2]).withMessage("inv_type must be 1 (product) or 2 (service)"),
        body("inv_has_variants")
            .optional().isInt().isIn([0, 1]).withMessage("inv_has_variants must be 0 or 1"),
        body("inv_is_exempt")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_exempt must be 0 or 1"),
        body("inv_is_stockable")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_stockable must be 0 or 1"),
        body("inv_is_lot_managed")
            .optional().isInt().isIn([0, 1]).withMessage("inv_is_lot_managed must be 0 or 1"),
        body("inv_brand")
            .optional().isString().withMessage("inv_brand must be a string"),
        body("inv_model")
            .optional().isString().withMessage("inv_model must be a string"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

export default router;