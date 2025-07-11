import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import 'dotenv/config';

export const validatorRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: 'error', errors: errors.array() });
        }
        next();
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Error al validar request'});
    }
}
