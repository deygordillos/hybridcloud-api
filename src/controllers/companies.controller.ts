import { Request, response, Response } from "express";
import messages from "../config/messages";
import { CompanyService } from "../services/CompanyService";
import { errorResponse, successResponse } from "../helpers/responseHelper";

export class CompaniesController {
    /**
    * List companies
    * @param req Request object with query params: offset, limit, group_id (optional)
    * @param res Response object
    * @returns 
    */
    static async list(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;
            const group_id = req.query.group_id ? parseInt(req.query.group_id as string) : undefined;

            const { data, total } = await CompanyService.list(offset, limit, group_id);
            const totalPages = Math.ceil(total / limit);
            
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };
            return successResponse(res, 'Companies found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving companies', 503, e);
        }
    }
    
    /**
     * Create a company
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            // const user = req['user'] || {};
            const { 
                group_id, company_is_principal, company_name, company_color, company_razon_social, company_id_fiscal, company_email, company_address,
                company_phone1, company_phone2, company_website, company_facebook, company_instagram, company_url_logo, company_contact_name,
                company_contact_phone, company_contact_email, company_start, company_end, country_id 
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
            return res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Update a company
     * @param req Request object { group_name, group_status }
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const company_id = parseInt(req.params.id, 10) || 0; // get user id from URL param
            if (!company_id) return res.status(400).json({ message: messages.Companies.company_needed });
            if (isNaN(company_id)) return res.status(400).json({ error: "Invalid companyId" });

            const { 
                company_is_principal, company_status, company_name, company_color, company_razon_social, company_id_fiscal, company_email, company_address,
                company_phone1, company_phone2, company_website, company_facebook, company_instagram, company_url_logo, company_contact_name,
                company_contact_phone, company_contact_email, company_start, company_end
            } = req.body;
            const response = await CompanyService.update(
                company_id,
                (company_is_principal == 0 || company_is_principal == 1 ? company_is_principal : 0),
                (company_status == 0 || company_status == 1 ? company_status : 0),
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
            );
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

// export const migrateDatabase = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const company_id = req.params.id; // get user id from URL param
//         // If company not exists
//         if (!company_id) return res.status(400).json({ message: messages.Companies.company_not_exists });
//         appDataSource
//         .initialize()
//         .then(async () => {
//             const companyRepository = appDataSource.getRepository(Companies);
//             const data = await companyRepository.findOneBy({
//                 company_id: parseInt(company_id)
//             });
//             // If company not exists
//             if (!data) return res.status(404).json({ message: messages.Companies.company_not_exists });
//             const db = data.company_database;

//             const appDataSourceCompany = new DataSource({
//                 type: "mysql",
//                 name: "company_conection",
//                 host: process.env.DB_HOST || 'localhost',
//                 port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
//                 username: process.env.DB_USERNAME || '',
//                 password: process.env.DB_PASSWORD || '',
//                 database: db,
//                 logging: false,
//                 synchronize: false,
//                 entities: ['dist/entity/**/*.js'],
//                 migrations: ['src/migration/companies/*.js'],
//                 subscribers: ['src/subscriber/**/*.ts']
//             })
//             appDataSourceCompany.initialize()
//             .then(() => {
//                 appDataSourceCompany.runMigrations();
//                 console.log('Migración ok')
//                 res.status(200).json({ message: `Migración en la base de datos ejecutada con éxito` });
//             })
//             .catch((err) => {
//                 console.error("Error during Data Source initialization:", err)
//                 return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//             })
//             appDataSource.destroy();
//         })
//         .catch((err) => {
//             console.error("Error during Data Source initialization:", err)
//             appDataSource.destroy();
//             return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//         })
        
//     } catch (error) {
//         console.error('Error al ejecutar la migración:', error);
//         return res.status(500).json({ message: 'Error al ejecutar la migración' });
//     }
// }

// export const revertMigrateDatabase = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const company_id = req.params.id; // get user id from URL param
//         // If company not exists
//         if (!company_id) return res.status(400).json({ message: messages.Companies.company_not_exists });
//         appDataSource
//         .initialize()
//         .then(async () => {
//             const companyRepository = appDataSource.getRepository(Companies);
//             const data = await companyRepository.findOneBy({
//                 company_id: parseInt(company_id)
//             });
//             // If company not exists
//             if (!data) return res.status(404).json({ message: messages.Companies.company_not_exists });
//             const db = data.company_database;

//             const appDataSourceCompany = new DataSource({
//                 type: "mysql",
//                 name: "company_conection",
//                 host: process.env.DB_HOST || 'localhost',
//                 port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
//                 username: process.env.DB_USERNAME || '',
//                 password: process.env.DB_PASSWORD || '',
//                 database: db,
//                 logging: false,
//                 synchronize: false,
//                 entities: ['dist/entity/**/*.js'],
//                 migrations: ['src/migration/companies/*.js'],
//                 subscribers: ['src/subscriber/**/*.ts']
//             })
//             appDataSourceCompany.initialize()
//             .then(() => {
//                 appDataSourceCompany.undoLastMigration();
//                 console.log('Migración ok')
//                 res.status(200).json({ message: `Migración en la base de datos ejecutada con éxito` });
//             })
//             .catch((err) => {
//                 console.error("Error during Data Source initialization:", err)
//                 return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//             })
//             appDataSource.destroy();
//         })
//         .catch((err) => {
//             console.error("Error during Data Source initialization:", err)
//             appDataSource.destroy();
//             return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//         })
        
//     } catch (error) {
//         console.error('Error al ejecutar la migración:', error);
//         return res.status(500).json({ message: 'Error al ejecutar la migración' });
//     }
// }