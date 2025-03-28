import { Companies } from "../entity/companies.entity";
import { Users } from "../entity/users.entity";
import { UsersCompaniesRepository } from "../repositories/UsersCompanies";

export class UsersCompaniesService {
    static async linkUserToCompany(user: Users, company: Companies, is_company_admin: number = 0) {
        const newRelation = UsersCompaniesRepository.create({
            user_id: user,
            company_id: company,
            is_company_admin,
            created_at: new Date(),
        });

        await UsersCompaniesRepository.save(newRelation);
        return newRelation;
    }

    static async getUserCompanies(user: Users) {
        const companies = await UsersCompaniesRepository
            .createQueryBuilder("uc")
            .leftJoinAndSelect("uc.company_id", "company")
            .where("uc.user_id = :user_id", { user_id: user.user_id })
            .select(["company.company_id as company_id", "company.company_name as company_name"])
            .getRawMany();

        return companies; // Extrae solo los datos de la empresa
    }
}