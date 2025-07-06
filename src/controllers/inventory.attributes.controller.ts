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

            const attributes = await InventoryAttrsService.getAllByCompany(company_id);
            return res.json({ data: attributes });
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

            const data = { ...req.body, company_id };
            const attr_values = data.attr_values || [];
            
            const exitsAttr = await InventoryAttrsService.findByName(company_id, data.attr_name || '');
            if (exitsAttr) return res.status(400).json({ message: "Attribute with this name already exists" });

            const attribute = await InventoryAttrsService.create(data);

            if (attr_values.length > 0) {
                for (const attr_value of attr_values) {
                    const createdValue = await InventoryAttrsService.createAttrValue({
                        inv_attr_id: attribute.inv_attr_id,
                        attr_value: attr_value
                    });
                    if (!createdValue) return res.status(500).json({ message: "Error creating attribute value", error: "Failed to create attribute value" });
                }
            }
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