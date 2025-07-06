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
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }
                    if (
                        !Array.isArray(variant.attr_values) ||
                        variant.attr_values.length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty attr_values array");
                    }
                    for (const id of variant.attr_values) {
                        if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                            throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                        }
                    }
                }
                return true;
            }),
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
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }
                    if (
                        !Array.isArray(variant.attr_values) ||
                        variant.attr_values.length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty attr_values array");
                    }
                    for (const id of variant.attr_values) {
                        if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                            throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                        }
                    }
                }
                return true;
            }),
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
        body("taxes")
            .optional()
            .isArray({ min: 1 }).withMessage("taxes must be an array of numeric IDs")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const id of arr) {
                    if (typeof id !== "number" || !Number.isInteger(id)) {
                        throw new Error("Each tax ID in taxes must be an integer number");
                    }
                }
                return true;
            }),
        body("variants")
            .optional()
            .isArray({ min: 1 }).withMessage("variants must be a non-empty array")
            .custom((arr) => {
                if (!Array.isArray(arr)) return true; // skip if not present
                for (const variant of arr) {
                    if (typeof variant !== "object" || variant === null) {
                        throw new Error("Each variant must be an object");
                    }
                    if (
                        typeof variant.inv_var_sku !== "string" ||
                        variant.inv_var_sku.trim().length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty inv_var_sku (string)");
                    }
                    if (
                        "inv_var_status" in variant &&
                        (typeof variant.inv_var_status !== "number" ||
                        ![0, 1].includes(variant.inv_var_status))
                    ) {
                        throw new Error("inv_var_status must be 0 or 1 if provided");
                    }
                    if (
                        !Array.isArray(variant.attr_values) ||
                        variant.attr_values.length === 0
                    ) {
                        throw new Error("Each variant must have a non-empty attr_values array");
                    }
                    for (const id of variant.attr_values) {
                        if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
                            throw new Error("Each attr_values item must be a valid inv_attrval_id (integer > 0)");
                        }
                    }
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    InventoryController.update
);

export default router;