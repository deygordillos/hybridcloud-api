import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import bcrypt from "bcrypt";
import 'dotenv/config';

import { Users } from "../entity/users.entity";
import messages from "../config/messages";

/**
 * Create an user
 * @param req Request object { username, password, user_type, email, first_name, last_name, user_phone }
 * @param res Response object
 * @returns 
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { username, password, user_type, email, first_name, last_name, user_phone } = req.body;

        const userData = await appDataSource.manager.findOneBy(Users, {
            username: username
        });
        // If username exists
        if (userData) return res.status(400).json({ message: messages.User.user_exists });

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRepository = appDataSource.getRepository(Users);
        const user = userRepository.create({ username, password: hashedPassword, user_type, email, first_name, last_name, user_phone });
        await userRepository.save(user);

        res.status(201).json({ message: messages.User.user_created, data: user });
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
        const { email, first_name, last_name, user_phone } = req.body;

        if (!user_id) return res.status(400).json({ message: messages.User.user_needed });

        const userRepository = appDataSource.getRepository(Users);

        const userData = await userRepository.findOneBy({
            id: parseInt(user_id)
        });
        // If user not exists
        if (!userData) return res.status(400).json({ message: messages.User.user_not_exists });

        // Actualiza los campos del usuario
        userData.email      = email      || userData.email;
        userData.first_name = first_name || userData.first_name;
        userData.last_name  = last_name  || userData.last_name;
        userData.user_phone = user_phone || userData.user_phone;
        userData.updated_at = new Date();
        
        delete userData.password;

        // Guarda los cambios en la base de datos
        await userRepository.save(userData);

        res.status(200).json({ message: messages.User.user_updated, data: userData });
    } catch (e) {
        console.log('UserController.updateUser catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}