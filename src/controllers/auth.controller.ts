import { Request, Response } from "express";
import { appDataSource } from "../app-data-source"
import { Equal } from "typeorm";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { User } from "../entity/user.entity";
import messages from "../config/messages";


export const authLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const authHeader  = req.headers['authorization'] // basic randomhashbase64
        const tokenBase64 = authHeader && authHeader.split(' ')[1]
        if (!tokenBase64) return res.status(400).send({ message: messages.Auth.user_complete_user_and_pass });

        const plain = Buffer.from(tokenBase64, 'base64').toString('utf8')
        const username = plain && plain.split(':')[0]
        const password = plain && plain.split(':')[1]

        // Looking for user by username
        const userData = await appDataSource.manager.findOneBy(User, {
            usuario: Equal(username)
        });
        // If not founded username
        if (!userData) return res.status(404).json({ message: messages.Auth.user_not_found });

        if (password === userData.clave) {
            const user = {
                id: userData.id,
                username: username,
                sucursal: userData.sucursal,
                empresa: userData.empresa
            };
            // Generar el token JWT
            const accessToken  = jwt.sign({user},  process.env.JWT_ACCESS_TOKEN,  { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS });
            const refreshToken = jwt.sign({user},  process.env.JWT_REFRESH_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH });

            res.json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                data: user
            });
        } else {
            return res.status(401).json({ error: messages.Auth.user_auth_incorrect });
        }
    } catch (e) {
        console.log('AuthController.login catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

export const refreshLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)  return res.status(400).json({message: 'Access Denied. No refresh token provided.'});
        console.log('refreshToken: ', refreshToken);
        console.log('JWT_REFRESH_TOKEN: ', process.env.JWT_REFRESH_TOKEN);
        const decoded         = jwt.verify(refreshToken,  process.env.JWT_REFRESH_TOKEN);
        const user  = decoded.user;
        const accessToken     = jwt.sign({user},  process.env.JWT_ACCESS_TOKEN, { expiresIn:  process.env.JWT_EXPIRES_IN_ACCESS });
        const newRefreshToken = jwt.sign({user},  process.env.JWT_REFRESH_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH });

        console.log('accessToken: ', accessToken);
        console.log('newRefreshToken: ', newRefreshToken);

        res.json({
            accessToken: accessToken,
            refreshToken: newRefreshToken,
            data: decoded.user
        });
    } catch (error) {
        return res.status(401).json({message: messages.Auth.invalid_refresh_token});
    }
}

export const testLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        res.json({
            test: 'OK'
        });
    } catch (error) {
        return res.status(400).json({
            message: messages.Auth.invalid_refresh_token
        });
    }
}