import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryFamilyService } from "../services/InventoryFamilyService";

export class InventoryFamilyController {
    /**
     * List of companies's inventories family
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getInventoryFamiliesByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });
            
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });
            
            const offset = (page - 1) * limit;
            const { total, data } = await InventoryFamilyService.getInventoryFamilyByCompanyId(company_id, offset, limit, status);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                total: total,
                data,
                currentPage: page,
                totalPages,
                perPage: limit,
            });
        } catch (error) {
            console.error("Error fetching customers:", error);
            res.status(500).json({ message: error.message });
        }
    }
    
    /**
     * Create an inventory family
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const data = { ...req.body, company_id };

            const invFamilyExists = await InventoryFamilyService.findInventoryFamilyByCode(data.inv_family_code || '');
            if (invFamilyExists) return res.status(400).json({ message: messages.InventoryFamily.invFamily_exists });
            
            const invFamily = await InventoryFamilyService.create(data);

            return res.status(201).json({
                message: messages.InventoryFamily.invFamily_created,
                data: invFamily
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update an inventory family
     * @param req Request object { }
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const id_inv_family = parseInt(req.params.id, 10) || 0; // get id_inv_family from URL param
            if (!id_inv_family) return res.status(400).json({ message: messages.InventoryFamily.invFamily_needed });
            if (isNaN(id_inv_family)) return res.status(400).json({ error: "Invalid inventory family Id" });

            const invFamily = await InventoryFamilyService.findInventoryFamilyById(id_inv_family);
            if (!invFamily) return res.status(400).json({ message: messages.InventoryFamily.invFamily_not_exists });

            const response = await InventoryFamilyService.update(
                invFamily,
                req.body
            );
            res.json(response);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}