import { Request, Response } from "express";
import { TypesOfPricesService } from "../services/TypesOfPricesService";

export class TypesOfPricesController {
    /**
     * Get all types of prices for a company
     */
    static async getAllByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'];
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;
            const { data, total } = await TypesOfPricesService.getAllByCompany(company_id, offset, limit, status);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Type of prices found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });

        } catch (e) {
            return res.status(500).json({ message: "Error getting types of prices", error: e?.message || e });
        }
    }

    /**
     * Get a type of price by ID
     */
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const type = await TypesOfPricesService.findById(Number(id));
            if (!type) return res.status(404).json({ message: "Type of price not found" });
            return res.json({ data: type });
        } catch (e) {
            return res.status(500).json({ message: "Error getting type of price", error: e?.message || e });
        }
    }

    /**
     * Create a new type of price
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'];
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const existingType = await TypesOfPricesService.findByCompanyAndName(company_id, req.body.typeprice_name);
            if (existingType) return res.status(400).json({ message: "Type of price already exists" });
            
            const data = { ...req.body, company_id };
            const type = await TypesOfPricesService.create(data);
            return res.status(201).json({ message: "Type of price created", data: type });
        } catch (e) {
            return res.status(500).json({ message: "Error creating type of price", error: e?.message || e });
        }
    }

    /**
     * Update a type of price
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await TypesOfPricesService.update(Number(id), req.body);
            if (!updated) return res.status(404).json({ message: "Type of price not found" });
            return res.json({ message: "Type of price updated", data: updated });
        } catch (e) {
            return res.status(500).json({ message: "Error updating type of price", error: e?.message || e });
        }
    }

    /**
     * Delete a type of price
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await TypesOfPricesService.delete(Number(id));
            if (result.affected === 0) return res.status(404).json({ message: "Type of price not found" });
            return res.json({ message: "Type of price deleted" });
        } catch (e) {
            return res.status(500).json({ message: "Error deleting type of price", error: e?.message || e });
        }
    }
}