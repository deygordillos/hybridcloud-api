import { Request, Response } from "express";
import messages from "../config/messages";
import { errorResponse, successResponse } from "../helpers/responseHelper";
import { InventoryFamilyService } from "../services/InventoryFamilyService";
import { TaxesService } from "../services/TaxesService";

export class InventoryFamilyController {
    /**
     * List of companies's inventories family
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getInventoryFamiliesByCompany(req: Request, res: Response) {
        try {
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);
            
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);
            
            const offset = (page - 1) * limit;
            const { total, data } = await InventoryFamilyService.getInventoryFamilyByCompanyId(company_id, offset, limit, status);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages,
            };

            return successResponse(res, "Inventory families found", 200, data, pagination);
        } catch (error: any) {
            console.error("Error fetching customers:", error);
            return errorResponse(res, error.message, 500, error);
        }
    }
    
    /**
     * Create an inventory family
     * @param req Request object 
     * example: {"company_id":1,"inv_family_code":"ELEC","inv_family_name":"Electronics","inv_family_status":1,"inv_is_stockable":1,"inv_is_lot_managed":0,"tax_id":1}
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const data = { ...req.body, company_id };

            // If tax_id is given, validate if it is one of the company
            const { tax_id } = req.body
            if (tax_id) {
                const tax_exists = await TaxesService.findTaxById(tax_id);
                if (!tax_exists) return errorResponse(res, messages.Tax.tax_not_exists, 400)
            }

            const invFamilyExists = await InventoryFamilyService.findInventoryFamilyByCode(data.inv_family_code || '');
            if (invFamilyExists) return errorResponse(res, messages.InventoryFamily.invFamily_exists, 400);
            
            const invFamily = await InventoryFamilyService.create(data);

            return successResponse(res, messages.InventoryFamily.invFamily_created, 201, invFamily);
        } catch (error: any) {
            return errorResponse(res, error.message, 500, error);
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
            if (!id_inv_family) return errorResponse(res, messages.InventoryFamily.invFamily_needed, 400);
            if (isNaN(id_inv_family)) return errorResponse(res, "Invalid inventory family Id", 400);

            const invFamily = await InventoryFamilyService.findInventoryFamilyById(id_inv_family);
            if (!invFamily) return errorResponse(res, messages.InventoryFamily.invFamily_not_exists, 404);

            const response = await InventoryFamilyService.update(
                invFamily,
                req.body
            );
            return successResponse(res, response.message, 200, null);
        } catch (error: any) {
            return errorResponse(res, error.message, 500, error);
        }
    }
}