import { Request, Response } from "express";
import { CustomersService } from "../services/CustomersService";
import { CompanyService } from "../services/CompanyService";

export class CustomersController {
    /**
     * List company customers
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getCustomersByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });
            
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) {
                return res.status(400).json({ message: "Invalid pagination parameters" });
            }
            const offset = (page - 1) * limit;
            const { total, customers } = await CustomersService.getCustomersByCompanyId(company_id, offset, limit);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                totalCustomers: total,
                customers,
                currentPage: page,
                totalPages,
                perPage: limit,
            });
        } catch (error) {
            console.error("Error fetching customers:", error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Create a customer
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            /*const { 
                cust_code
            } = req.body;

            const response = await CompanyService.create(
                parseInt(group_id), 
                (company_is_principal == 0 || company_is_principal == 1 ? company_is_principal : 0),
                company_name || '', 
                company_color || null, 
                company_razon_social || null, 
                company_id_fiscal || null, 
                company_email || null,
                company_address || null,
                company_phone1 || null,
                company_phone2 || null,
                company_website || null,
                company_facebook || null,
                company_instagram || null,
                company_url_logo || null,
                company_contact_name || null,
                company_contact_phone || null,
                company_contact_email || null,
                company_start || Date(),
                company_end || Date(),
                parseInt(country_id)
            );
            res.json(response);*/
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}