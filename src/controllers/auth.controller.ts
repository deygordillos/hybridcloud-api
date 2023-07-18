import { Request, Response } from "express";
import { appDataSource } from "../app-data-source"
import { Equal } from "typeorm";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { User } from "../entity/user.entity";
import messages from "../config/messages";
import config from "../config/config";

export const authLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const authHeader = req.headers['authorization']
        const tokenBase64 = authHeader && authHeader.split(' ')[1]
        if (!tokenBase64) return res.status(400).send({ message: 'Please, you have to complete username and password' });

        const plain = Buffer.from(tokenBase64, 'base64').toString('utf8')
        const username = plain && plain.split(':')[0]
        const password = plain && plain.split(':')[1]

        // Looking for user by username
        const userData = await appDataSource.manager.findOneBy(User, {
            usuario: Equal(username)
        });
        // If not founded username
        if (!userData) return res.status(404).send({ message: messages.Auth.user_not_found });

        if (password === userData.clave) {
            const user = {
                id: userData.id,
                username: username,
                sucursal: userData.sucursal,
                empresa: userData.empresa,
                expireIn: config.JWT_EXPIRES_IN
            };
            // Generar el token JWT
            const accessToken = jwt.sign({ user }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
            const refreshToken = jwt.sign({ user }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN_REFRESH });

            res
                .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
                .header('Authorization', accessToken)
                .send(user);
        } else {
            return res.status(401).json({ error: messages.Auth.user_auth_incorrect });
        }
    } catch (e) {
        console.log('AuthController.login catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

export const refreshLogin = async (req: Request, res: Response): Promise<Response> => {
    console.log('cookies:', req.cookies )
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return res.status(401).send('Access Denied. No refresh token provided.');
    }
    try {
        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);
        const accessToken = jwt.sign({ user: decoded.user }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

        res
            .header('Authorization', accessToken)
            .send(decoded.user);
    } catch (error) {
        return res.status(400).send('Invalid refresh token.');
    }
}