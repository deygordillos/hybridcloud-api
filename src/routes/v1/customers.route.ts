import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { CustomersController } from '../../controllers/customers.controller';

const router = Router();

router.get('/',
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.getCustomersByCompany);

router.post('/',
    [
        authMiddleware,
        companyMiddleware,
        body("cust_code").notEmpty().isString().withMessage("cust_code is required"),
        body("cust_id_fiscal").notEmpty().isString().withMessage("cust_id_fiscal is required")
            .isLength({ max: 30 }).withMessage("cust_id_fiscal must be a string (max 30 chars)"),
        body("cust_description").notEmpty().isString().withMessage("cust_description is required")
            .isLength({ max: 150 }).withMessage("cust_description must be a string (max 150 chars)"),
        body("cust_email").optional().isEmail().withMessage("Invalid email format"),
        body("cust_telephone1").optional().isString().isLength({ max: 20 }).withMessage("cust_telephone1 must be a string (max 20 chars)"),
        validatorRequestMiddleware
    ],
    CustomersController.create);

router.put('/:id', 
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.update);

router.patch('/:id', 
    [
        authMiddleware,
        companyMiddleware
    ],
    CustomersController.update);
export default router