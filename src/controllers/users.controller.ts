import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import bcrypt from "bcrypt";
import 'dotenv/config';

import { Users } from "../entity/users.entity";
import messages from "../config/messages";

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