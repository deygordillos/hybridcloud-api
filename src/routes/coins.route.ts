import { Router } from 'express'
import { body, check } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { findAllCoins } from '../controllers/coins.controller';

const router = Router();

router.get('/',
    checkJwtMiddleware,
    findAllCoins);

// router.put('/assign_sucursales/:id', checkJwtMiddleware, 
//     [
//         // Valida que "sucursal_id" sea un array
//         check('sucursal_id').isArray().notEmpty().isLength({min: 1}).withMessage('El campo "sucursal_id" debe ser un array de números'),
//         // Valida que cada elemento del array sea un número
//         check('sucursal_id.*').isNumeric().withMessage('Cada elemento del array debe ser un número'),
//         // Opcional: Valida que no haya elementos duplicados en el array
//         check('sucursal_id').custom((value) => {
//             if (value.length === 0) {
//                 throw new Error('Debe ingresar valores');
//             } else if (new Set(value).size !== value.length) {
//                 throw new Error('No se permiten elementos duplicados en el array');
//             }
//             return true;
//         })
//     ],
//     validatorRequestMiddleware,
//     assignTaxToSucursales);

export default router