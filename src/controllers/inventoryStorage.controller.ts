import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryStorageService } from "../services/InventoryStorageService";

export class InventoryStorageController {
    /**
     * List of company's inventory storages
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getInventoryStoragesByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });
            
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });
            
            const offset = (page - 1) * limit;
            const { total, data } = await InventoryStorageService.getInventoryStorageByCompanyId(company_id, offset, limit, status);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                total: total,
                data,
                currentPage: page,
                totalPages,
                perPage: limit,
            });
        } catch (error) {
            console.error("Error fetching inventory storages:", error);
            res.status(500).json({ message: error.message });
        }
    }
    
    /**
     * Create an inventory storage
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const data = { ...req.body, company_id };

            const invStorageExists = await InventoryStorageService.findInventoryStorageByCode(data.inv_storage_code || '');
            if (invStorageExists) return res.status(400).json({ message: messages.InventoryStorage?.invStorage_exists ?? "Inventory Storage already exists" });
            
            const invStorage = await InventoryStorageService.create(data);

            return res.status(201).json({
                message: messages.InventoryStorage?.invStorage_created ?? "Inventory Storage created",
                data: invStorage
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update an inventory storage
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const id_inv_storage = parseInt(req.params.id, 10) || 0;
            if (!id_inv_storage) return res.status(400).json({ message: messages.InventoryStorage?.invStorage_needed ?? "Inventory Storage ID is required" });
            if (isNaN(id_inv_storage)) return res.status(400).json({ error: "Invalid inventory storage Id" });

            const invStorage = await InventoryStorageService.findInventoryStorageById(id_inv_storage);
            if (!invStorage) return res.status(400).json({ message: messages.InventoryStorage?.invStorage_not_exists ?? "Inventory Storage does not exist" });

            const response = await InventoryStorageService.update(
                invStorage,
                req.body
            );
            res.json(response);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}