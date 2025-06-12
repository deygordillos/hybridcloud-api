import { Request, Response } from "express";
import { GroupService } from "../services/GroupService";
import messages from "../config/messages";

export class GroupController {
    /**
     * List all groups
     * @param req Request object { }
     * @param res Response object
     * @returns 
     */
    static async list(req: Request, res: Response) {
        try {
            const user = req['user'] || {};
            const { offset, limit } = req.query;
            const offsetNumber = parseInt(offset as string, 10) || 0; // Default to 0 if not provided
            const limitNumber = parseInt(limit as string, 10) || 10; // Default to 10 if not provided
            const response = await GroupService.findGroups(offsetNumber, limitNumber);
            return res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Create a company group
     * @param req Request object { group_name  }
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const user = req['user'] || {};
            const { group_name } = req.body;
            const response = await GroupService.create(group_name, user);
            return res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update a group
     * @param req Request object { group_name, group_status }
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const group_id = parseInt(req.params.id, 10) || 0; // get user id from URL param
            if (!group_id) return res.status(400).json({ message: messages.Groups.group_needed });
            if (isNaN(group_id)) return res.status(400).json({ error: "Invalid group ID" });

            const { group_name, group_status } = req.body;
            const response = await GroupService.update(group_id, group_name, group_status);
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}