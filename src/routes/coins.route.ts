import { Router } from 'express'
import { body, check } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { findAllCoins, assignCoinsToCompanies, assignCoinsToSucursales } from '../controllers/coins.controller';

const router = Router();

router.get('/',
    checkJwtMiddleware,
    findAllCoins);

router.put('/assign_to_company/:company_id', checkJwtMiddleware,
    [
        check('coins').isArray().notEmpty().isLength({ min: 1 }).withMessage('El campo "coins" debe ser un array de números con al menos un elemento')
            .custom(coinsArray => {
                if (!Array.isArray(coinsArray) || coinsArray.length === 0) {
                    throw new Error('El campo "coins" debe contener al menos un objeto JSON');
                }
                for (const coin of coinsArray) {
                    if (typeof coin !== 'object' || Array.isArray(coin)) {
                        throw new Error('Cada elemento del arreglo "coins" debe ser un objeto JSON');
                    }
                }
                return true;
            }),
        // Valida que cada elemento del array sea un número
        check('coins.*.id').isNumeric().withMessage('Cada elemento del array debe ser un número'),
        check('coins.*.factor').isFloat().withMessage('El campo "factor" debe ser un número decimal'),
    ],
    validatorRequestMiddleware,
    assignCoinsToCompanies);

router.put('/:coin_id/assign/:company_id/sucursales', checkJwtMiddleware,
    [
        // Valida que "sucursal_id" sea un array
        check('sucursal_id').isArray().notEmpty().isLength({ min: 1 }).withMessage('El campo "sucursal_id" debe ser un array de números'),
        // Valida que cada elemento del array sea un número
        check('sucursal_id.*').isNumeric().withMessage('Cada elemento del array debe ser un número'),
        // Opcional: Valida que no haya elementos duplicados en el array
        check('sucursal_id').custom((value) => {
            if (value == 0) {
                throw new Error('Debe ingresar valores');
            } else if (value.length === 0) {
                throw new Error('Debe ingresar valores');
            } else if (new Set(value).size !== value.length) {
                throw new Error('No se permiten elementos duplicados en el array');
            }
            return true;
        })
    ],
    validatorRequestMiddleware,
    assignCoinsToSucursales);

export default router