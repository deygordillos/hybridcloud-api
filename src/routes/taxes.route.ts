import { Router } from 'express'
import { body, check } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { findAllTaxes, createTax, updateTax, assignTaxToSucursales } from '../controllers/taxes.controller';

const router = Router();

router.get('/',
    checkJwtMiddleware,
    findAllTaxes);

router.post('/',
    [
        body('tax_code').notEmpty().trim().withMessage("You must send a tax_code name"),
        body('tax_description').notEmpty().trim().withMessage("You must send a tax_description"),
        body('tax_siglas').notEmpty().trim().withMessage("You must send a tax_siglas"),
        body('tax_type').notEmpty().trim().isInt().isIn([1,2]).withMessage("You must send if tax type. 1 no-affects 2 affects"),
        body('tax_percentage').notEmpty().trim().withMessage("tax_percentage"),
        body('tax_affects_cost').notEmpty().trim().isInt().isIn([0,1]).withMessage("You must send if tax affects cost. 1 yes 0 no")
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware,
    createTax);

router.put('/:id', [
        body('tax_description').notEmpty().trim().withMessage("You must send a tax_description"),
        body('tax_status').notEmpty().trim().isInt().isIn([0,1]).withMessage("You must send a tax status. 1 active 0 inactive"),
        body('tax_affects_cost').notEmpty().trim().isInt().isIn([0,1]).withMessage("You must send if tax affects cost. 1 yes 0 no"),
        body('tax_type').notEmpty().trim().isInt().isIn([1,2]).withMessage("You must send if tax type. 1 no-affects 2 affects"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware, 
    updateTax);

router.put('/assign_sucursales/:id', checkJwtMiddleware, 
    [
        // Valida que "sucursal_id" sea un array
        check('sucursal_id').isArray().notEmpty().isLength({min: 1}).withMessage('El campo "sucursal_id" debe ser un array de números'),
        // Valida que cada elemento del array sea un número
        check('sucursal_id.*').isNumeric().withMessage('Cada elemento del array debe ser un número'),
        // Opcional: Valida que no haya elementos duplicados en el array
        check('sucursal_id').custom((value) => {
            if (value.length === 0) {
                throw new Error('Debe ingresar valores');
            } else if (new Set(value).size !== value.length) {
                throw new Error('No se permiten elementos duplicados en el array');
            }
            return true;
        })
    ],
    validatorRequestMiddleware,
    assignTaxToSucursales);
export default router