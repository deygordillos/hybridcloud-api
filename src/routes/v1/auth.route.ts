import { Router } from 'express'
import { body } from "express-validator";
import { AuthController } from '../../controllers/auth.controller';
import { validatorRequestMiddleware } from '../../middlewares/validator_request';

const router = Router();
// router.post("/register", AuthController.register);
router.post('/login', 
    [
        body('username').notEmpty().withMessage("You must send a username").trim(),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim(),
        validatorRequestMiddleware
    ],
    AuthController.login);

router.post('/refresh', 
    [
        body('refresh_token').notEmpty().withMessage("Access Denied. No refresh token provided").trim(),
        validatorRequestMiddleware
    ],
    AuthController.refreshLogin);

export default router