import { Request, Response } from "express";
import { CustomersService } from "../services/CustomersService";
import { CompanyService } from "../services/CompanyService";
import messages from "../config/messages";

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

            // Extraer datos del body y agregar company_id manualmente
            const customerData = { ...req.body, company_id };
            const customer = await CustomersService.create(customerData);

            // Responder con el nuevo cliente creado
            return res.status(201).json({
                message: messages.Customers.customer_created,
                customer
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update a customer
     * @param req Request object { }
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const customer_id = parseInt(req.params.id, 10) || 0; // get customer_id from URL param
            if (!customer_id) return res.status(400).json({ message: messages.Customers.customer_needed });
            if (isNaN(customer_id)) return res.status(400).json({ error: "Invalid customer_id" });

            const customer = await CustomersService.findCustomerById(customer_id);
            if (!customer) throw new Error(messages.Customers.customer_not_exists || "Ups! Customer not exists.");

            const response = await CustomersService.update(
                customer,
                req.body
            );
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}