import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { checkJwtMiddleware } from '../middlewares/check-jwt';
import { createCompany, migrateDatabase, updateCompany } from '../controllers/companies.controller';

const router = Router();
router.post('/',
    [
        body('company_name').notEmpty().trim().withMessage("You must send a company name"),
        body('company_razon_social').notEmpty().trim().withMessage("You must send a business name"),
        body('company_id_fiscal').notEmpty().trim().withMessage("You must send a fiscal id"),
        body('company_email').notEmpty().trim().withMessage("You must send a company email"),
        body('company_phone').notEmpty().trim().withMessage("You must send a company phone"),
        body('country_id').notEmpty().trim().withMessage("You must send a country_id"),
        body('group_id').notEmpty().trim().withMessage("You must send a group_id"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware,
    createCompany);

router.put('/:id', [
        body('company_name').notEmpty().trim().withMessage("You must send a company name"),
    ],
    validatorRequestMiddleware,
    checkJwtMiddleware, 
    updateCompany);

router.post('/migrate/:id',
    checkJwtMiddleware, 
    migrateDatabase);

export default router