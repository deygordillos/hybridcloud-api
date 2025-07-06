import { Request, Response } from "express";
import { InventoryAttrsService } from "../services/InventoryAttrsService";

export class InventoryAttributesController {
    /**
     * Get all attributes by company
     */
    static async getAllByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'];
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const attr_status = req.query?.attr_status ? Number(req.query.attr_status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;

            const { data, total } = await InventoryAttrsService.getAllByCompany(company_id, offset, limit, attr_status);
            const totalPages = Math.ceil(total / limit);
            
            return res.json({
                code: 200,
                message: 'Attributes found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });
        } catch (e) {
            return res.status(500).json({ message: "Error getting attributes", error: e?.message || e });
        }
    }

    /**
     * Create a new attribute
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'];
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const { attr_name, attr_description, attr_status } = req.body;
            const { attr_values } = req.body;

            const body = { attr_name, attr_description, attr_status };
            const data = { ...body, company_id };
            
            const exitsAttr = await InventoryAttrsService.findByName(company_id, data.attr_name || '');
            if (exitsAttr) return res.status(400).json({ message: "Attribute with this name already exists" });

            const new_attribute = await InventoryAttrsService.create(data);

            if (attr_values.length > 0) {
                for (const attr_value of attr_values) {
                    const createdValue = await InventoryAttrsService.createAttrValue({
                        inv_attr_id: new_attribute.inv_attr_id,
                        attr_value: attr_value
                    });
                    if (!createdValue) return res.status(500).json({ message: "Error creating attribute value", error: "Failed to create attribute value" });
                }
            }

            const attribute = await InventoryAttrsService.findById(company_id, new_attribute.inv_attr_id);
            return res.status(201).json({ message: "Attribute created", data: attribute });
        } catch (e) {
            return res.status(500).json({ message: "Error creating attribute", error: e?.message || e });
        }
    }

    /**
     * Update an attribute
     */
    static async update(req: Request, res: Response) {
        try {
            const company_id = req['company_id'];
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const { id } = req.params;
            const { attr_name, attr_description, attr_status } = req.body;
            const { attr_values } = req.body;

            const attribute = await InventoryAttrsService.update(Number(company_id), Number(id), {
                attr_name,
                attr_description,
                attr_status
            });
            if (!attribute) return res.status(404).json({ message: "Attribute not found" });

            if (attr_values.length > 0) {
                for (const attr_value of attr_values) {
                    const existsAttrValue = await InventoryAttrsService.findAttrValue(attribute.inv_attr_id, attr_value);

                    if (!existsAttrValue) {
                        const createdValue = await InventoryAttrsService.createAttrValue({
                            inv_attr_id: attribute.inv_attr_id,
                            attr_value
                        });
                        if (!createdValue) return res.status(500).json({ message: "Error creating attribute value", error: "Failed to create attribute value" });
                    }
                }
            }
            return res.json({ message: "Attribute updated", data: attribute });
        } catch (e) {
            return res.status(500).json({ message: "Error updating attribute", error: e?.message || e });
        }
    }
}