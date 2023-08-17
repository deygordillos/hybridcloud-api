import { Router } from 'express'
import { body } from "express-validator";
import { validatorRequestMiddleware } from '../middlewares/validator_request';
import { createUser } from '../controllers/users.controller';

const router = Router();
router.post('/',
    [
        body('username').notEmpty().trim().withMessage("You must send a username"),
        body('password').notEmpty().trim().withMessage("You must send a password"),
        body('user_type').notEmpty().trim().withMessage("You must send a user type (1 for user API, 2 for user web, 3 for user POS, 4 user app)"),
        body('email').notEmpty().trim().isEmail().withMessage("You must send a valid email"),
        body('first_name').notEmpty().trim().withMessage("You must send your name"),
    ],
    validatorRequestMiddleware,
    createUser);

export default router