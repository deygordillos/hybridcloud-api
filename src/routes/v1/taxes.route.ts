import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { TaxesController } from '../../controllers/taxes.controller';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

// Enum para tax_type
export enum TaxTypeEnum {
    EXCENT = 1,
    PERCENT = 2,
    FIXED = 3
}

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    TaxesController.getTaxesByCompany);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_code')
            .notEmpty().trim().isString().withMessage("You must send a tax_code"),
        body('tax_name')
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description')
            .optional().trim().isString().withMessage("tax_description must be a string"),
        body('tax_type')
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value')
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.create);

router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_name')
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description').optional()
            .trim().isString().withMessage("tax_description must be a string"),
        body('tax_type')
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value')
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.update);

router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('tax_name').optional()
            .notEmpty().trim().isString().withMessage("You must send a tax_name"),
        body('tax_description').optional()
            .trim().isString().withMessage("tax_description must be a string"),
        body('tax_type').optional()
            .notEmpty().isInt().isIn([TaxTypeEnum.EXCENT, TaxTypeEnum.PERCENT, TaxTypeEnum.FIXED]).withMessage("You must send a tax_type (1 excent, 2 percent, 3 fixed)"),
        body('tax_value').optional()
            .notEmpty().withMessage("You must send a valid tax_value")
            .isFloat({ min: 0 }).withMessage("You must send a valid tax_value")
            .custom((value) => {
                if (typeof value === 'string') {
                    throw new Error("tax_value must be a number, not a string");
                }
                return true;
            }),
        validatorRequestMiddleware
    ],
    TaxesController.update);

export default router