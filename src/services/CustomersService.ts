import slugify from "slugify";
import messages from "../config/messages";
// import { Users } from "../entity/users.entity";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { CountryRepository } from "../repositories/CountryRepository";
import { GroupRepository } from "../repositories/GroupRepository";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { Companies } from "../entity/companies.entity";

export class CustomersService {
    /**
     * Get customers by company id
     * @param company_id Company ID
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @returns Customers and total count
     */
    static async getCustomersByCompanyId(company_id: number, offset: number = 0, limit: number = 10) {
        const [customers, total] = await CustomerRepository
            .createQueryBuilder("customer")
            .where("customer.company_id = :company_id", { company_id })
            .orderBy("customer.customer_id", "DESC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount(); // Obtiene clientes + total de registros

        return { customers, total };
    }

    static async create(
        group_id: number,
        company_is_principal: number,
        company_name: string,
        company_color: string,
        company_razon_social: string,
        company_id_fiscal: string,
        company_email: string,
        company_address: string,
        company_phone1: string,
        company_phone2: string,
        company_website: string,
        company_facebook: string,
        company_instagram: string,
        company_url_logo: string,
        company_contact_name: string,
        company_contact_phone: string,
        company_contact_email: string,
        company_start: Date,
        company_end: Date,
        country_id: number
    ) {
        // Verify group by id
        const group = await GroupRepository.findOneBy({ group_id });
        if (!group) throw new Error(messages.Groups.group_not_exists || "Ups! Group not exists.");

        // Verify country by id
        const country = await CountryRepository.findOneBy({ country_id });
        if (!country) throw new Error(messages.Country.country_not_exists || "Ups! Country not exists.");

        // Verifiy if company exists by name
        const existingCompany = await CompanyRepository.findOneBy({ company_name });
        if (existingCompany) throw new Error(messages.Companies.company_exists || "Ups! Company already exists.");

        const company = CompanyRepository.create({
            group_id: group,
            company_is_principal,
            company_name,
            created_at: new Date(),
            updated_at: new Date(),
            company_color,
            company_razon_social,
            company_slug: slugify(company_name).toLocaleLowerCase(),
            company_id_fiscal,
            company_email,
            company_address,
            company_phone1,
            company_phone2,
            company_website,
            company_facebook,
            company_instagram,
            company_url_logo,
            company_contact_name,
            company_contact_phone,
            company_contact_email,
            company_start,
            company_end,
            country_id: country
        });
        await CompanyRepository.save(company);
        return { message: messages.Companies.company_created };
    }

    static async update(
        company_id: number,
        company_is_principal: number,
        company_name: string,
        company_color: string,
        company_razon_social: string,
        company_id_fiscal: string,
        company_email: string,
        company_address: string,
        company_phone1: string,
        company_phone2: string,
        company_website: string,
        company_facebook: string,
        company_instagram: string,
        company_url_logo: string,
        company_contact_name: string,
        company_contact_phone: string,
        company_contact_email: string,
        company_start: Date,
        company_end: Date
    ) {
        const company = await CompanyRepository.findOneBy({ company_id });
        if (!company) throw new Error(messages.Companies.company_not_exists || "Ups! Company not exists.");

        company.company_is_principal = (company_is_principal == 0 || company_is_principal == 1 ? company_is_principal : company.company_is_principal);
        company.company_name = company_name || company.company_name;
        company.company_color = company_color || company.company_color;
        company.company_razon_social = company_razon_social || company.company_razon_social;
        company.company_id_fiscal = company_id_fiscal || company.company_id_fiscal;
        company.company_email = company_email || company.company_email;
        company.company_address = company_address || company.company_address;
        company.company_phone1 = company_phone1 || company.company_phone1;
        company.company_phone2 = company_phone2 || company.company_phone2;
        company.company_website = company_website || company.company_website;
        company.company_facebook = company_facebook || company.company_facebook;
        company.company_instagram = company_instagram || company.company_instagram;
        company.company_url_logo = company_url_logo || company.company_url_logo;
        company.company_contact_name = company_contact_name || company.company_contact_name;
        company.company_contact_phone = company_contact_phone || company.company_contact_phone;
        company.company_contact_email = company_contact_email || company.company_contact_email;
        company.company_start = company_start || company.company_start;
        company.company_end = company_end || company.company_end;
        company.updated_at = new Date();

        await CompanyRepository.save(company);
        return { message: messages.Companies.company_updated };
    }

}