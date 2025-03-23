import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = req['user'];

    if (!user || user.is_admin !== 1) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
};
