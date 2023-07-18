import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers['authorization'];
    const refreshToken = req.cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ message: 'Access Denied. No token provided.'});
    }

    try {
        const decoded = jwt.verify(accessToken, config.JWT_SECRET);
        next();
    } catch (error) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Access Denied. No refresh token provided.'});
        }

        try {
            const decoded     = jwt.verify(refreshToken, config.JWT_SECRET);
            const accessToken = jwt.sign({ user: decoded.user }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

            res
            .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
            .header('Authorization', accessToken)
            .send(decoded.user);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid Token.'});
        }
    }
}
