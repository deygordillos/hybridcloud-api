import { Request, Response } from "express";
import messages from "../config/messages";
import { TaxesService } from "../services/TaxesService";

export class TaxesController {
    /**
     * List taxes by company
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getTaxesByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const status = req.query?.status ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;
            const { data, total } = await TaxesService.getTaxesByCompanyId(company_id, offset, limit, status);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Taxes found',
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
     * Create a tax
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const { tax_code, tax_name, tax_description, tax_status, tax_type, tax_value } = req.body;

            // Check if tax already exists
            const taxExists = await TaxesService.findTaxByCode(company_id, tax_code);
            if (taxExists) return res.status(400).json({ message: messages.Tax?.tax_exists ?? "Tax already exists" });

            const tax = await TaxesService.create({
                company_id,
                tax_code,
                tax_name,
                tax_description,
                tax_status,
                tax_type,
                tax_value
            });

            return res.status(201).json({ message: messages.Tax?.tax_created ?? "Tax created", data: tax });
        } catch (e) {
            console.error('TaxesController.create catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }

    /**
     * Update a tax
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const tax_id = parseInt(req.params.id, 10);
            if (!tax_id) return res.status(400).json({ message: messages.Tax?.tax_needed ?? "Tax ID is required" });

            const tax = await TaxesService.findTaxById(tax_id);
            if (!tax) return res.status(404).json({ message: messages.Tax?.tax_not_exists ?? "Tax does not exist" });

            const { tax_name, tax_description, tax_status, tax_type, tax_value } = req.body;

            const response = await TaxesService.update(tax, {
                tax_name,
                tax_description,
                tax_status,
                tax_type,
                tax_value
            });

            return res.status(200).json(response);
        } catch (e) {
            console.error('TaxesController.update catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }
}