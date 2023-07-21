import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export const checkJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader   = req.headers['authorization']; // bearer randomhashjwt
    const accessToken  = authHeader && authHeader.split(' ')[1];
    if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});
    
    try {
        jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid Token.'});
    }
}
