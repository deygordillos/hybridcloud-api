import { Request, Response } from "express";
import messages from "../config/messages";
import { errorResponse, successResponse } from "../helpers/responseHelper";
import { InventoryService } from "../services/InventoryService";
import { InventoryFamilyService } from "../services/InventoryFamilyService";
import { TaxesService } from "../services/TaxesService";
import { InventoryTaxesService } from "../services/InventoryTaxesService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryAttrsService } from "../services/InventoryAttrsService";
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
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;

            const filters = {
                inv_status:        req.query.inv_status        !== undefined ? Number(req.query.inv_status)        : 1,
                inv_type:          req.query.inv_type          !== undefined ? Number(req.query.inv_type)          : undefined,
                inv_has_variants:  req.query.inv_has_variants  !== undefined ? Number(req.query.inv_has_variants)  : undefined,
                inv_is_exempt:     req.query.inv_is_exempt     !== undefined ? Number(req.query.inv_is_exempt)     : undefined,
                inv_is_stockable:  req.query.inv_is_stockable  !== undefined ? Number(req.query.inv_is_stockable)  : undefined,
                inv_is_lot_managed:req.query.inv_is_lot_managed!== undefined ? Number(req.query.inv_is_lot_managed): undefined,
                inv_brand:         req.query.inv_brand         ? String(req.query.inv_brand)                       : undefined,
                inv_model:         req.query.inv_model         ? String(req.query.inv_model)                       : undefined,
                id_inv_family:     req.query.id_inv_family     !== undefined ? Number(req.query.id_inv_family)     : undefined,
            };

            const { data, total } = await InventoryService.getInventoriesByCompanyId(company_id, offset, limit, filters);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages,
            };

            return successResponse(res, "Inventories found", 200, data, pagination);
        } catch (e: any) {
            console.error(e);
            return errorResponse(res, e.message, 500);
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
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const data = { ...req.body, company_id };
            const taxes: number[] = Array.isArray(req.body.taxes) ? req.body.taxes : [];
            const variants = Array.isArray(req.body.variants) ? req.body.variants : [];

            // Check if familyExists
            const inventoryFamily = await InventoryFamilyService.findInventoryFamilyById(data.id_inv_family);
            if (!inventoryFamily) return errorResponse(res, messages.InventoryFamily?.invFamily_not_exists ?? "Inventory family does not exist", 404);

            // Check if inventory already exists
            const inventoryExists = await InventoryService.findInventoryByCode(company_id, data.inv_code);
            if (inventoryExists) return errorResponse(res, messages.Inventory?.inv_exists ?? "Inventory already exists", 400);

            const inventory = await InventoryService.create(data, taxes, variants);
            const new_inventory = await InventoryService.findInventoryById(inventory.inv_id);

            return successResponse(res, messages.Inventory?.inv_created ?? "Inventory created", 201, new_inventory);
        } catch (e: any) {
            console.error('InventoryController.create catch error: ', e.message, e.stack);
            return errorResponse(res, e.message, 500);
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
            if (!inv_id) return errorResponse(res, messages.Inventory?.inv_needed ?? "Inventory ID is required", 400);

            const inventory = await InventoryService.findInventoryById(inv_id);
            if (!inventory) return errorResponse(res, messages.Inventory?.inv_not_exists ?? "Inventory does not exist", 404);

            const { id_inv_family } = req.body;
            const taxes: number[] = Array.isArray(req.body.taxes) ? req.body.taxes : [];
            const variants = Array.isArray(req.body.variants) ? req.body.variants : [];

            if (id_inv_family) {
                // Check if familyExists
                const inventoryFamily = await InventoryFamilyService.findInventoryFamilyById(id_inv_family);
                if (!inventoryFamily) return errorResponse(res, messages.InventoryFamily?.invFamily_not_exists ?? "Inventory family does not exist", 404);
            }

            // If taxes are provided, update associations
            if (taxes.length > 0) {
                // Validate all tax IDs exist before associating
                for (const tax_id of taxes) {
                    const taxExists = await TaxesService.findTaxById(tax_id);
                    if (!taxExists) {
                        return errorResponse(res, `Tax with id ${tax_id} does not exist`, 404);
                    }
                }
                // Remove previous associations and add new ones
                await InventoryTaxesService.replaceTaxes(inv_id, taxes);
            }

            // If variants are provided, update associations
            if (variants.length > 0) {
                for (const variant of variants) {
                    const { inv_var_sku, inv_var_status = 1, attr_values = [] } = variant;

                    let createdVariant = await InventoryVariantsService.findBySku(inv_id, inv_var_sku);

                    if (createdVariant) {
                        // Si viene el id, actualiza la variante existente
                        createdVariant = await InventoryVariantsService.updateVariant(createdVariant.inv_var_id, {
                            inv_var_sku,
                            inv_var_status
                        });
                    } else {
                        // Si no viene id, crea una nueva variante
                        createdVariant = await InventoryVariantsService.createVariant({
                            inv_id,
                            inv_var_sku,
                            inv_var_status
                        });
                    }

                    if (Array.isArray(attr_values) && attr_values.length > 0) {
                        // Validar que todos los attr_values existan antes de asociar
                        for (const inv_attrval_id of attr_values) {
                            const exists = await InventoryAttrsService.findAttrValueById(inv_attrval_id);
                            if (!exists) return errorResponse(res, `Attribute value with id ${inv_attrval_id} does not exist`, 404);
                        }
                        await InventoryVariantsService.upsertAttributesToVariant(
                            createdVariant!.inv_var_id,
                            attr_values
                        );
                    }
                }
            }

            const data = await InventoryService.update(inventory, req.body);

            return successResponse(res, messages.Inventory?.inv_updated ?? "Inventory updated", 200, data);
        } catch (e: any) {
            console.error('InventoryController.update catch error: ', e.message, e.stack);
            return errorResponse(res, e.message, 500);
        }
    }
}