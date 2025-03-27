import messages from "../config/messages";
import { Companies } from "../entity/companies.entity";
import { Users } from "../entity/users.entity";
import { UsersCompaniesRepository } from "../repositories/UsersCompanies";

export class UsersCompaniesService {
    static async linkUserToCompany(user_id: Users, company_id: Companies, is_company_admin: number = 0) {
        const newRelation = UsersCompaniesRepository.create({
            user_id,
            company_id,
            is_company_admin,
            created_at: new Date(),
        });

        await UsersCompaniesRepository.save(newRelation);
        return newRelation;
    }
}