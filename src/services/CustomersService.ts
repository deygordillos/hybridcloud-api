import messages from "../config/messages";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { Customers } from "../entity/customers.entity";

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

    static async create(customerData: Pick<Customers, "company_id" | "cust_code" | "cust_id_fiscal" | "cust_description" | "cust_email" | "cust_telephone1" | "cust_status">) {
        const newCustomer = CustomerRepository.create(customerData);
        await CustomerRepository.save(newCustomer);

        return newCustomer;
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