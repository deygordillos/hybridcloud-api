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
            .isInt({ min: 1 }).withMessage("You must send a valid tax_percentage")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("id_inv_family must be a number, not a string");
                }
                return true;
            }),
        body("inv_name")
            .optional().isString().withMessage("inv_name must be a string"),
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
        body("inv_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_stock must be a positive number"),
        body("inv_previous_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_previous_stock must be a positive number"),
        body("inv_avg_cost")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost must be a positive number"),
        body("inv_avg_cost_previous")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost_previous must be a positive number"),
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
        body("inv_name")
            .optional().isString().withMessage("inv_name must be a string"),
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
        body("inv_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_stock must be a positive number"),
        body("inv_previous_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_previous_stock must be a positive number"),
        body("inv_avg_cost")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost must be a positive number"),
        body("inv_avg_cost_previous")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost_previous must be a positive number"),
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
        body("inv_name")
            .optional().isString().withMessage("inv_name must be a string"),
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
        body("inv_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_stock must be a positive number"),
        body("inv_previous_stock")
            .optional().isFloat({ min: 0 }).withMessage("inv_previous_stock must be a positive number"),
        body("inv_avg_cost")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost must be a positive number"),
        body("inv_avg_cost_previous")
            .optional().isFloat({ min: 0 }).withMessage("inv_avg_cost_previous must be a positive number"),
        body("inv_url_image")
            .optional().isString().withMessage("inv_url_image must be a string"),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

export default router;