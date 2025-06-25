import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryService } from "../services/InventoryService";
import { InventoryFamilyService } from "../services/InventoryFamilyService";

export class InventoryController {
    /**
     * List inventories by company
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getInventoriesByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const inv_status = req.query?.inv_status ? Number(req.query.inv_status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryService.getInventoriesByCompanyId(company_id, offset, limit, inv_status);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Inventories found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });
        } catch (e) {
            console.error(e);
            return res.status(503).send({ message: 'error', data: e });
        }
    }

    /**
     * Create an inventory
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const data = { ...req.body, company_id };

            // Check if familyExists
            const inventoryFamily = await InventoryFamilyService.findInventoryFamilyById(data.id_inv_family);
            if (!inventoryFamily) return res.status(400).json({ message: messages.InventoryFamily?.invFamily_not_exists ?? "Inventory family does not exist" });

            // Check if inventory already exists
            const inventoryExists = await InventoryService.findInventoryByCode(company_id, data.inv_code);
            if (inventoryExists) return res.status(400).json({ message: messages.Inventory?.inv_exists ?? "Inventory already exists" });

            const inventory = await InventoryService.create(data);

            return res.status(201).json({ message: messages.Inventory?.inv_created ?? "Inventory created", data: inventory });
        } catch (e) {
            console.error('InventoryController.create catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }

    /**
     * Update an inventory
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const inv_id = parseInt(req.params.id, 10);
            if (!inv_id) return res.status(400).json({ message: messages.Inventory?.inv_needed ?? "Inventory ID is required" });

            const inventory = await InventoryService.findInventoryById(inv_id);
            if (!inventory) return res.status(404).json({ message: messages.Inventory?.inv_not_exists ?? "Inventory does not exist" });

            const response = await InventoryService.update(inventory, req.body);

            return res.status(200).json(response);
        } catch (e) {
            console.error('InventoryController.update catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }
}