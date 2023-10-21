import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import bcrypt from "bcrypt";
import 'dotenv/config';

import { Users } from "../entity/users.entity";
import messages from "../config/messages";
import { Sucursales } from "../entity/sucursales.entity";
import { In } from "typeorm";
import { Rel_Users_Sucursales } from "../entity/rel_users_sucursales.entity";

/**
 * Create an user
 * @param req Request object { username, password, user_type, email, first_name, last_name, user_phone, sucursal_id }
 * @param res Response object
 * @returns 
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password, user_type, email, first_name, last_name, user_phone, sucursal_id } = req.body;
        appDataSource
        .initialize()
        .then(async () => {
            const sucursalData = await appDataSource.manager.findOneBy(Sucursales, {
                sucursal_id: parseInt(sucursal_id)
            });
            // If sucursal not exists
            if (!sucursalData) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });

            const userData = await appDataSource.manager.findOneBy(Users, {
                username: username
            });
            // If username exists
            if (userData) return res.status(400).json({ message: messages.User.user_exists });

            const hashedPassword = await bcrypt.hash(password, 10);

            // Creo el user
            const userRepository = appDataSource.getRepository(Users);
            const user = userRepository.create({ username, password: hashedPassword, user_type, email, first_name, last_name, user_phone, sucursal_id });
            await userRepository.save(user);

            res.status(201).json({ message: messages.User.user_created, data: user });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('UserController.createUser catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Update a user
 * @param req Request object :id { email, first_name, last_name, user_phone }
 * @param res Response object
 * @returns 
 */
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user_id = req.params.id; // get user id from URL param
        const { email, first_name, last_name, user_phone, user_status } = req.body;

        if (!user_id) return res.status(400).json({ message: messages.User.user_needed });

        appDataSource
        .initialize()
        .then(async () => {
            const userRepository = appDataSource.getRepository(Users);

            const userData = await userRepository.findOneBy({
                id: parseInt(user_id)
            });
            // If user not exists
            if (!userData) return res.status(400).json({ message: messages.User.user_not_exists });

            // Actualiza los campos del usuario
            userData.email = email || userData.email;
            userData.first_name = first_name || userData.first_name;
            userData.last_name = last_name || userData.last_name;
            userData.user_phone = user_phone || userData.user_phone;
            userData.updated_at = new Date();
            userData.user_status = (user_status == 0 || user_status == 1 ? user_status : userData.user_status);
            
            delete userData.password;

            // Guarda los cambios en la base de datos
            await userRepository.save(userData);
            res.status(200).json({ message: messages.User.user_updated, data: userData });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('UserController.updateUser catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Assign sucursal to an user
 * @param req Request object :id { sucursal_id: array | int }
 * @param res Response object
 * @returns 
 */
export const assignSucursalesToUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user_id = req.params.id; // get user id from URL param
        const { sucursal_id } = req.body;
        if (!user_id) return res.status(400).json({ message: messages.User.user_needed });

        appDataSource
        .initialize()
        .then(async () => {
            const userRepository = appDataSource.getRepository(Users);
            const userData = await userRepository.findOneBy({
                id: parseInt(user_id)
            });
            // If user not exists
            if (!userData) return res.status(400).json({ message: messages.User.user_not_exists });

            const sucursalRepository = appDataSource.getRepository(Sucursales);
            const sucursalData = await sucursalRepository.find({
                where: {
                    sucursal_id: In(sucursal_id),
                }
            });
            // If sucursales not exists
            if (!sucursalData || sucursalData.length == 0) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });
            
            (async () => {
                const relUserSucRepository = appDataSource.getRepository(Rel_Users_Sucursales);
            
                try {
                    const promises = sucursalData.map((sucursal) => {
                        const relUserSuc = new Rel_Users_Sucursales();
                        relUserSuc.users = userData;
                        relUserSuc.sucursales = sucursal;
                        return relUserSucRepository.save(relUserSuc);
                    });
                
                    await Promise.all(promises);
                    console.log("Todas las inserciones exitosas");
                } catch (error) {
                    console.error("Error al insertar: ", error.sqlMessage);
                }
            })();

            res.status(200).json({ message: messages.User.user_updated });
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('UserController.assignSucursalesToUser catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}