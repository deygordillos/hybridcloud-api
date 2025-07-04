import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import { Buffer } from "buffer";
import { UserRepository } from "../repositories/UserRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ") && !authHeader?.startsWith("Basic ")) {
        return res.status(400).json({ error: "Token no proporcionado" });
    }

    if (authHeader?.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            req['user'] = verifyToken(token);
            next();
        } catch {
            return res.status(401).json({ error: "Token inválido" });
        }
    }

    if (authHeader?.startsWith("Basic ")) {
        const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString("utf-8");
        const [username, password] = credentials.split(":");

        const user = await UserRepository.findOne({ where: { username } });

        if (!user || !(await user.validarPassword(password))) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        req['user'] = { user_id: user.user_id, username: user.username, is_admin: user.is_admin };
        next();
    }
};