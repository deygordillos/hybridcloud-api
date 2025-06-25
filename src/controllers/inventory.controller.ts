import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryService } from "../services/InventoryService";
import { InventoryFamilyService } from "../services/InventoryFamilyService";
import { TaxesService } from "../services/TaxesService";
import { InventoryTaxesService } from "../services/InventoryTaxesService";
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
            const taxes: number[] = Array.isArray(req.body.taxes) ? req.body.taxes : [];

            // Check if familyExists
            const inventoryFamily = await InventoryFamilyService.findInventoryFamilyById(data.id_inv_family);
            if (!inventoryFamily) return res.status(404).json({ message: messages.InventoryFamily?.invFamily_not_exists ?? "Inventory family does not exist" });

            // Check if inventory already exists
            const inventoryExists = await InventoryService.findInventoryByCode(company_id, data.inv_code);
            if (inventoryExists) return res.status(400).json({ message: messages.Inventory?.inv_exists ?? "Inventory already exists" });

            const inventory = await InventoryService.create(data, taxes);
            return res.status(201).json({ message: messages.Inventory?.inv_created ?? "Inventory created", data: inventory });
        } catch (e) {
            console.error('InventoryController.create catch error: ', e);
            return res.status(500).json({ error: e?.message || e });
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
            
            const { id_inv_family } = req.body
            const taxes: number[] = Array.isArray(req.body.taxes) ? req.body.taxes : [];

            if (id_inv_family) {
                // Check if familyExists
                const inventoryFamily = await InventoryFamilyService.findInventoryFamilyById(id_inv_family);
                if (!inventoryFamily) return res.status(404).json({ message: messages.InventoryFamily?.invFamily_not_exists ?? "Inventory family does not exist" });
            }

            // If taxes are provided, update associations
            if (taxes.length > 0) {
                // Validate all tax IDs exist before associating
                for (const tax_id of taxes) {
                    const taxExists = await TaxesService.findTaxById(tax_id);
                    if (!taxExists) {
                        return res.status(404).json({ message: `Tax with id ${tax_id} does not exist` });
                    }
                }
                // Remove previous associations and add new ones
                await InventoryTaxesService.replaceTaxes(inv_id, taxes);
            }

            const response = await InventoryService.update(inventory, req.body);

            return res.status(200).json(response);
        } catch (e) {
            console.error('InventoryController.update catch error: ', e);
            return res.status(500).json({ error: e?.message || e });
        }
    }
}