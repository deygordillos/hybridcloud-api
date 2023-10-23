import { Router } from 'express'
import { body, check } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { createUser, updateUser, assignSucursalesToUser } from '../controllers/users.controller';

const router = Router();
router.post('/',
    [
        body('username').notEmpty().trim().withMessage("You must send a username"),
        body('password').notEmpty().trim().withMessage("You must send a password"),
        body('user_type').notEmpty().trim().isInt().isIn([1,2,3,4]).withMessage("You must send a user type (1 for user API, 2 for user web, 3 for user POS, 4 user app)"),
        body('email').notEmpty().trim().isEmail().withMessage("You must send a valid email"),
        body('first_name').notEmpty().trim().withMessage("You must send your first name"),
        body('sucursal_id').notEmpty().trim().withMessage("You must send a sucursal id"),
    ],
    validatorRequestMiddleware,
    createUser);

router.put('/:id', checkJwtMiddleware, updateUser);

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
    assignSucursalesToUser);
export default router