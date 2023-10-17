import { Request, Response } from "express";
import { appDataSource } from "../app-data-source"
import { Equal } from "typeorm";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import 'dotenv/config';
import { Users } from "../entity/users.entity";
import messages from "../config/messages";
import { Sucursales } from "../entity/sucursales.entity";
import { Companies } from "../entity/companies.entity";


export const authLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const authHeader  = req.headers['authorization'] // basic base64(username:password)
        const tokenBase64 = authHeader && authHeader.split(' ')[1]
        if (!tokenBase64) return res.status(400).send({ message: messages.Auth.user_complete_user_and_pass });

        const plain = Buffer.from(tokenBase64, 'base64').toString('utf8')
        const username = plain && plain.split(':')[0]
        const password = plain && plain.split(':')[1]
        
        appDataSource
        .initialize()
        .then(async () => {
            console.log("Data Source has been initialized!")
            // Looking for user by username
            const userData = await appDataSource.manager.findOneBy(Users, {
                username: Equal(username)
            });
            // If not founded username
            if (!userData) return res.status(404).json({ message: messages.Auth.user_not_found });
            
            if (userData.user_status !== 1) return res.status(404).json({ message: messages.Auth.user_not_found });

            const sucursalRepository = appDataSource.getRepository(Sucursales);
            const sucursalData = await sucursalRepository.findOneBy({
                sucursal_id: userData.sucursal_id
            });

            const companyRepository = appDataSource.getRepository(Companies);
            const companyData = await companyRepository.findOneBy({
                company_id: sucursalData.company_id
            });

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: messages.Auth.user_auth_incorrect });
            }
            
            delete userData.password;
            delete userData.access_token;
            delete userData.refresh_token;
            // Actualizo fecha del login
            userData.last_login = new Date();
            userData.ip_address = req.socket.remoteAddress ? req.socket.remoteAddress.toString().replace('::ffff:', '') : null;
            
            let user : any = userData;
            user.company_id = sucursalData.company_id;
            user.database = companyData.company_database;

            // Generar el token JWT
            const accessToken  = jwt.sign({user},  process.env.JWT_ACCESS_TOKEN,  { expiresIn: process.env.JWT_EXPIRES_IN_ACCESS });
            const refreshToken = jwt.sign({user},  process.env.JWT_REFRESH_TOKEN, { expiresIn: process.env.JWT_EXPIRES_IN_REFRESH });
            
            userData.access_token  = accessToken;
            userData.refresh_token = refreshToken;
            
            await appDataSource.manager.save(Users, userData);
            
            delete user.access_token;
            delete user.refresh_token;
            appDataSource.destroy();
            res.json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                data: user
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            appDataSource.destroy();
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
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
        appDataSource
        .initialize()
        .then(async () => {
            const userData = await appDataSource.manager.findOneBy(Users, {
                username: Equal(user.username)
            });
            
            userData.access_token  = accessToken;
            userData.refresh_token = refreshToken;
            
            await appDataSource.manager.save(Users, userData);
            
            delete user.access_token;
            delete user.refresh_token;

            console.log('accessToken: ', accessToken);
            console.log('newRefreshToken: ', newRefreshToken);
            appDataSource.destroy();
            res.json({
                accessToken: accessToken,
                refreshToken: newRefreshToken,
                data: user
            });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            appDataSource.destroy();
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
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