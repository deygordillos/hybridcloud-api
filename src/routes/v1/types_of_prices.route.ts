import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { TypesOfPricesController } from '../../controllers/types_of_prices.controller';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    TypesOfPricesController.getAllByCompany
);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.create
);

router.put('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.update
);

router.patch('/:id',
    [
        authMiddleware,
        companyMiddleware,
        body('typeprice_name')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_name")
            .isLength({ max: 50 }).withMessage("typeprice_name must be at most 50 characters"),
        body('typeprice_description')
            .optional().notEmpty().trim().isString().withMessage("You must send a typeprice_description")
            .isLength({ max: 150 }).withMessage("typeprice_description must be at most 150 characters"),
        body('typeprice_status')
            .optional().isInt().isIn([0, 1]).withMessage("typeprice_status must be 0 or 1"),
        validatorRequestMiddleware
    ],
    TypesOfPricesController.update
);

export default router