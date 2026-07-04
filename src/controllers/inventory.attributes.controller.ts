import { Request, Response } from "express";
import { errorResponse, successResponse } from "../helpers/responseHelper";
import { InventoryAttrsService } from "../services/InventoryAttrsService";

export class InventoryAttributesController {
    /**
     * Get all attributes by company
     */
    static async getAllByCompany(req: Request, res: Response) {
        try {
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const attr_status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;

            const { data, total } = await InventoryAttrsService.getAllByCompany(company_id, offset, limit, attr_status);
            const totalPages = Math.ceil(total / limit);

            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages,
            };

            return successResponse(res, "Attributes found", 200, data, pagination);
        } catch (error: any) {
            return errorResponse(res, error.message, 500, error);
        }
    }

    /**
     * Create a new attribute
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const { attr_name, attr_description, attr_status, attr_values } = req.body;
            const data = { attr_name, attr_description, attr_status, company_id };

            const exitsAttr = await InventoryAttrsService.findByName(company_id, data.attr_name || '');
            if (exitsAttr) return errorResponse(res, "Attribute with this name already exists", 400);

            const new_attribute = await InventoryAttrsService.create(data);

            if (attr_values?.length > 0) {
                for (const attr_value of attr_values) {
                    const createdValue = await InventoryAttrsService.createAttrValue({
                        inv_attr_id: new_attribute.inv_attr_id,
                        attr_value
                    });
                    if (!createdValue) return errorResponse(res, "Failed to create attribute value", 500);
                }
            }

            const attribute = await InventoryAttrsService.findById(company_id, new_attribute.inv_attr_id);
            return successResponse(res, "Attribute created", 201, attribute);
        } catch (error: any) {
            return errorResponse(res, error.message, 500, error);
        }
    }

    /**
     * Update an attribute
     */
    static async update(req: Request, res: Response) {
        try {
            const company_id = (req as any).company_id || false;
            if (!company_id) return errorResponse(res, "Company ID is required", 400);

            const { id } = req.params;
            const { attr_name, attr_description, attr_status, attr_values } = req.body;

            const attribute = await InventoryAttrsService.update(Number(company_id), Number(id), {
                attr_name,
                attr_description,
                attr_status
            });
            if (!attribute) return errorResponse(res, "Attribute not found", 404);

            if (Array.isArray(attr_values)) {
                const existingValues = attribute.attr_values ?? [];

                for (const existing of existingValues) {
                    if (!attr_values.includes(existing.attr_value)) {
                        await InventoryAttrsService.deleteAttrValue(existing.inv_attrval_id);
                    }
                }

                for (const attr_value of attr_values) {
                    const alreadyExists = existingValues.some(v => v.attr_value === attr_value);
                    if (!alreadyExists) {
                        const createdValue = await InventoryAttrsService.createAttrValue({
                            inv_attr_id: attribute.inv_attr_id,
                            attr_value
                        });
                        if (!createdValue) return errorResponse(res, "Failed to create attribute value", 500);
                    }
                }
            }

            return successResponse(res, "Attribute updated", 200, attribute);
        } catch (error: any) {
            return errorResponse(res, error.message, 500, error);
        }
    }
}