import messages from "../config/messages";
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

    static async findCustomerById(cust_id: number) {
        return await CustomerRepository.findOneBy({ cust_id });
    }
    
    /**
     * Create customer
     * @param customerData Customer data
     * @returns 
     */
    static async create(customerData: Pick<Customers, "company_id" | "cust_code" | "cust_id_fiscal" | "cust_description" | "cust_email" | "cust_telephone1" | "cust_status">) {
        const newCustomer = CustomerRepository.create(customerData);
        await CustomerRepository.save(newCustomer);

        return newCustomer;
    }

    /**
     * Update customer
     * @param cust_id 
     * @param customerData 
     * @returns 
     */
    static async update(
        customer: Customers,
        customerData: Pick<Customers, 
            "cust_description" | 
            "cust_status" | 
            "cust_address" | 
            "cust_address_complement" | 
            "cust_address_city" | 
            "cust_address_state" | 
            "cust_email" | 
            "cust_telephone1" | 
            "cust_telephone2" | 
            "cust_cellphone"
        >
    ) {
        customer.cust_description = customerData.cust_description;
        customer.cust_status = (customerData.cust_status === 0 || customerData.cust_status === 1) ? customerData.cust_status : 1;
        customer.cust_address = customerData.cust_address;
        customer.cust_address_complement = customerData.cust_address_complement;
        customer.cust_address_city = customerData.cust_address_city;
        customer.cust_address_state = customerData.cust_address_state;
        customer.cust_email = customerData.cust_email;
        customer.cust_telephone1 = customerData.cust_telephone1;
        customer.cust_telephone2 = customerData.cust_telephone2;
        customer.cust_cellphone = customerData.cust_cellphone;
        customer.updated_at = new Date();

        await CustomerRepository.save(customer);
        return { message: messages.Customers.customer_updated };
    }

}