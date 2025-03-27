import { Router } from 'express'
import { body } from "express-validator";
import { AuthController } from '../../controllers/auth.controller';

const router = Router();
// router.post("/register", AuthController.register);
router.post('/login', 
    [
        body('username').notEmpty().withMessage("You must send a username").trim(),
        body("password")
            .notEmpty().withMessage("Password is required")
            .trim()
    ], 
    AuthController.login);
//router.post('/refresh', refreshLogin);

export default router