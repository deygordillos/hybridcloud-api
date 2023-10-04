import { Router } from 'express'
import { body, query } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { createSucursal } from '../controllers/sucursales.controller';

const router = Router();
router.post('/',
    [
        body('sucursal_name').notEmpty().trim().withMessage("You must send a sucursal name"),
        body('sucursal_razon_social').notEmpty().trim().withMessage("You must send a business name"),
        body('sucursal_id_fiscal').notEmpty().trim().withMessage("You must send a fiscal id"),
        body('sucursal_email').notEmpty().trim().withMessage("You must send a sucursal email"),
        body('sucursal_phone').notEmpty().trim().withMessage("You must send a sucursal phone"),
        body('company_id').notEmpty().trim().withMessage("You must send a company_id"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware,
    createSucursal);

// router.put('/:id', [
//         body('company_name').notEmpty().trim().withMessage("You must send a company name"),
//     ],
//     validatorRequestMiddleware,
//     checkJwtMiddleware, 
//     updateGroup);

export default router