import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';

import { Groups } from "../entity/groups.entity";
import messages from "../config/messages";

/**
 * Create a company group
 * @param req Request object { group_name  }
 * @param res Response object
 * @returns 
 */
export const createGroup = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';

        const { group_name } = req.body;

        const decoded        = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const user  = decoded.user;
        if (user.is_admin === 0) return res.status(400).json({ message: 'No está autorizado para crear grupos' });
        
        const groupRepository = appDataSource.getRepository(Groups);
        const group = groupRepository.create({ group_name, created_by: user.id, created_at: new Date(), updated_at: new Date() });
        await groupRepository.save(group);

        res.status(201).json({ message: messages.Groups.group_created, data: group });
    } catch (e) {
        console.log('GroupController.createGroup catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Update a group
 * @param req Request object :id { group_name, group_status }
 * @param res Response object
 * @returns 
 */
export const updateGroup = async (req: Request, res: Response): Promise<Response> => {
    try {
        const group_id = req.params.id; // get user id from URL param
        const { group_name, group_status } = req.body;
        console.log(typeof group_id)
        // If group not exists
        if (!group_id) return res.status(400).json({ message: messages.Groups.group_needed });

        const groupRepository = appDataSource.getRepository(Groups);

        const data = await groupRepository.findOneBy({
            group_id: parseInt(group_id)
        });
        // If group not exists
        if (!data) return res.status(404).json({ message: messages.Groups.group_not_exists });

        // Actualiza los campos del usuario
        data.group_name   = group_name || data.group_name;
        data.group_status = (group_status == 0 || group_status == 1 ? group_status : data.group_status);
        data.updated_at = new Date();

        // Guarda los cambios en la base de datos
        await groupRepository.save(data);

        res.status(200).json({ message: messages.Groups.group_updated, data: data });
    } catch (e) {
        console.log('GroupController.updateGroup catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}