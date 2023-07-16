import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({ error: 'Token de autenticación inválido' });
        }

        console.log(decodedToken)
        next();
    });
}
