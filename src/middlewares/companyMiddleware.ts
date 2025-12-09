import { Request, Response, NextFunction } from "express";
import messages from "../config/messages";
import { UsersCompaniesService } from "../services/UsersCompaniesService";
import { UserService } from "../services/UserService";

export const companyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req['user']
    if (!user_id) return res.status(401).json({ error: messages.Auth.user_not_found });

    const user = await UserService.findById(user_id);
    if (!user) return res.status(401).json({ error: messages.Auth.user_not_found });

    // Valido que tenga 1 sola empresa asignada
    const usersCompanies = await UsersCompaniesService.getUserCompanies(user);
    if (!user.is_admin) {
        if (usersCompanies.length !== 1) {

            const companyId = req.headers['x-company-id'];
            if (!companyId) return res.status(400).json({ message: "Company ID is required" });

            const isValidCompany = usersCompanies.some(company => company.company_id === Number(companyId));
            if (!isValidCompany) return res.status(403).json({ message: "Invalid Company ID" });

            req["company_id"] = Number(companyId); // Guarda el ID de la empresa en la request
        } else {
            req["company_id"] = Number(usersCompanies[0].company_id) || '';
        }
    }
    next();
};