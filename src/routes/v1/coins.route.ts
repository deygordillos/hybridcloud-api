import { Router } from 'express'
import { body, check } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { checkJwtMiddleware } from '../../middlewares/check-jwt';
import { findAllCoins, assignCoinsToCompanies, assignCoinsToSucursales } from '../../controllers/coins.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/coins:
 *   get:
 *     summary: Get all coins
 *     description: Retrieves a list of all available currencies/coins
 *     tags: [Coins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coins retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    checkJwtMiddleware,
    findAllCoins);

/**
 * @swagger
 * /api/v1/coins/assign_to_company/{company_id}:
 *   put:
 *     summary: Assign coins to a company
 *     description: Assigns multiple coins with their conversion factors to a specific company
 *     tags: [Coins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coins
 *             properties:
 *               coins:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of coins to assign
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - factor
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Coin ID
 *                       example: 1
 *                     factor:
 *                       type: number
 *                       format: float
 *                       description: Conversion factor
 *                       example: 1.25
 *     responses:
 *       200:
 *         description: Coins assigned successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/v1/coins/{coin_id}/assign/{company_id}/sucursales:
 *   put:
 *     summary: Assign coin to company branches
 *     description: Assigns a specific coin to multiple branches (sucursales) of a company
 *     tags: [Coins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coin_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the coin
 *       - in: path
 *         name: company_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sucursal_id
 *             properties:
 *               sucursal_id:
 *                 type: array
 *                 minItems: 1
 *                 description: Array of branch IDs (no duplicates allowed)
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Coin assigned to branches successfully
 *       400:
 *         description: Invalid input data or duplicate branch IDs
 *       401:
 *         description: Unauthorized
 */
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