import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { CompaniesController } from '../../controllers/companies.controller';
import { adminMiddleware } from '../../middlewares/adminMiddleware';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { AuthController } from '../../controllers/auth.controller';

const router = Router();
router.post('/',
    [
        authMiddleware,
        adminMiddleware,
        body('group_id')
            .isInt()
            .custom((value) => {
                if (typeof value !== 'number') {
                    throw new Error("You must send a group_id as numeric");
                }
                return true;
            }),
        body('company_is_principal').notEmpty().trim().isBoolean().withMessage("You must send if is a principal company"),
        body('company_name').notEmpty().trim().withMessage("You must send a company name"),
        body('company_razon_social').notEmpty().trim().withMessage("You must send a business name"),
        body('company_id_fiscal').notEmpty().trim().withMessage("You must send a fiscal id"),
        body('company_email').notEmpty().trim().withMessage("You must send a company email"),
        body('company_phone1').notEmpty().trim().withMessage("You must send a company phone1"),
        body('company_start').notEmpty().withMessage("You must send a licence start").trim()
            .isISO8601().withMessage("Licence start must be a valid date in ISO8601 format")
            .toDate(),
        body('company_end').notEmpty().withMessage("You must send a licence end").trim()
            .isISO8601().withMessage("Licence end must be a valid date in ISO8601 format")
            .toDate().custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.company_start)) {
                throw new Error("Licence end must be after licence start");
            }
            return true;
        }),
        body('country_id')
            .isInt()
            .custom((value) => {
                if (typeof value !== 'number') {
                    throw new Error("You must send a country_id as numeric");
                }
                return true;
            }),
        validatorRequestMiddleware,
    ],
    CompaniesController.create);

router.put('/:id', 
    [
        authMiddleware, 
        adminMiddleware,
    ],
    CompaniesController.update);

router.patch('/:id', 
    [
        authMiddleware,
        adminMiddleware,
    ],
    CompaniesController.update);

router.post('/register_admin/:company_id',
    [
        authMiddleware,
        adminMiddleware,
        body('username').notEmpty().withMessage("You must send a username").trim(),
        body('password').notEmpty().withMessage("You must send a password").trim(),
        body('first_name').notEmpty().withMessage("You must send a first name").trim(),
        body('email').notEmpty().withMessage("Email is required").trim().isEmail().withMessage("Invalid email format"),
        validatorRequestMiddleware,
    ],
    AuthController.registerAdminCompany);
// router.post('/migrate/:id',
//     authMiddleware, 
//     adminMiddleware,
//     migrateDatabase);

// router.post('/migrate/:id/revert',
//     authMiddleware, 
//     adminMiddleware,
//     revertMigrateDatabase);

export default router