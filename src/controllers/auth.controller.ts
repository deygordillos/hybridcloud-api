import { Request, Response } from "express";
import 'dotenv/config';
import { AuthService } from "../services/AuthService";
import messages from "../config/messages";
import { CompanyService } from "../services/CompanyService";
import { UsersCompaniesService } from "../services/UsersCompaniesService";


export class AuthController {

    static async registerAdminCompany(req: Request, res: Response) {
        try {
            const company_id = parseInt(req.params.company_id, 10) || 0; // get user id from URL param
            const { username, password, first_name, email } = req.body;

            if (!company_id) return res.status(400).json({ message: messages.Companies.company_needed });
            if (isNaN(company_id)) return res.status(400).json({ error: "Invalid companyId" });

            if (!username || !password || !first_name || !email) {
                return res.status(400).json({ error: "Username, password, first_name and email are required" });
            }

            const company = await CompanyService.getCompany(company_id);
            if (!company) return res.status(404).json({ message: messages.Companies.company_not_exists });

            const user = await AuthService.registerAdmin(username, password, first_name, email);

            const response = await UsersCompaniesService.linkUserToCompany(user, company, 1);
            res.json({ message: messages.User.user_created });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: "Username and password are required" });
            }
            const response = await AuthService.login(username, password, req.ip);
            res.json(response);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
    
    static async refreshLogin(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;
            if (!refresh_token)  return res.status(400).json({message: 'Access Denied. No refresh token provided.'});

            const response = await AuthService.refreshLogin(refresh_token);
            res.json(response);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
}