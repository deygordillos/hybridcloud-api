import { Router } from 'express';
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { InventoryAttributesController } from '../../controllers/inventory.attributes.controller';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    InventoryAttributesController.getAllByCompany
);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.create
);

router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .optional().notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.update
);

router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body("attr_name")
            .optional().notEmpty().isString().withMessage("attr_name is required")
            .isLength({ max: 50 }).withMessage("attr_name must be at most 50 characters"),
        body("attr_description")
            .optional().isString().isLength({ max: 150 }).withMessage("attr_description must be at most 150 characters"),
        body("attr_status")
            .optional().isInt().isIn([0, 1]).withMessage("attr_status must be 0 or 1"),
        body("attr_values")
            .optional()
            .isArray({ min: 1 }).withMessage("attr_values must be an array of strings")
            .custom((arr) => {
                for (const id of arr) {
                    if (typeof id !== "string" || id.trim() === "") {
                        throw new Error("Each attr_value in attr_values must be a string");
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryAttributesController.update
);

export default router;