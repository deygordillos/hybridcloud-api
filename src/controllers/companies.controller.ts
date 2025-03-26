import { Request, Response } from "express";
import messages from "../config/messages";
import { CompanyService } from "../services/CompanyService";

export class CompaniesController {
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
            res.json(response);
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
                company_is_principal, company_name, company_color, company_razon_social, company_id_fiscal, company_email, company_address,
                company_phone1, company_phone2, company_website, company_facebook, company_instagram, company_url_logo, company_contact_name,
                company_contact_phone, company_contact_email, company_start, company_end
            } = req.body;
            const response = await CompanyService.update(
                company_id,
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
            );
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}


/**
 * Create a company
 * @param req Request object { company_name, company_color, company_razon_social, company_id_fiscal, company_email, 
 * company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo, company_contact_name,
 * company_contact_phone, company_contact_email, country_id, group_id  }
 * @param res Response object
 * @returns 
 */
// export const createCompany = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { authorization } = req.headers; // bearer randomhashjwt
//         const split = authorization.split(' ');
//         const accessToken = split[1] || '';

//         const { company_name, company_color, company_razon_social, company_id_fiscal, company_email,
//             company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
//             company_contact_name, company_contact_phone, company_contact_email, country_id, group_id } = req.body;

//         // Obtengo el usuario en token para comprobar sea user admin
//         const decoded        = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
//         const user  = decoded.user;
//         if (user.is_admin === 0) return res.status(400).json({ message: 'No está autorizado para crear empresas' });
//         appDataSource
//         .initialize()
//         .then(async () => {
//             // Busco si existe el grupo
//             const groupRepository = appDataSource.getRepository(Groups);
//             const dataGroup = await groupRepository.findOneBy({
//                 group_id: parseInt(group_id)
//             });
//             // If group not exists
//             if (!dataGroup) return res.status(404).json({ message: messages.Groups.group_not_exists });

//             const countryRepository = appDataSource.getRepository(Countries);
//             const dataCountry = await countryRepository.findOneBy({
//                 country_id: parseInt(country_id)
//             });
//             // If country not exists
//             if (!dataCountry) return res.status(404).json({ message: messages.Country.country_not_exists });

//             // Creo la empresa
//             const companyRepository = appDataSource.getRepository(Companies);
//             const company = companyRepository.create({
//                 company_name,
//                 created_at: new Date(),
//                 updated_at: new Date(),
//                 company_color,
//                 company_razon_social,
//                 company_slug: slugify(company_name).toLocaleLowerCase(),
//                 company_id_fiscal,
//                 company_email,
//                 company_phone,
//                 company_phone2,
//                 company_website,
//                 company_facebook,
//                 company_instagram,
//                 company_url_logo,
//                 company_contact_name,
//                 company_contact_phone,
//                 company_contact_email,
//                 country_id,
//                 group_id
//             });
//             await companyRepository.save(company);
            
//             company.company_database = 'hybrid_company_' + company.company_id;
            
//             // Guarda los cambios en la base de datos
//             await companyRepository.save(company);
//             /////////////////////////////////////////////////////
//             // Crear la base de datos asociada
//             /////////////////////////////////////////////////////
//             // Realizo creación de la base de datos
//             const rawData = await appDataSource.query(`CREATE DATABASE \`${company.company_database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`)

//             const appDataSourceCompany = new DataSource({
//                 type: "mysql",
//                 host: process.env.DB_HOST || 'localhost',
//                 port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
//                 username: process.env.DB_USERNAME || '',
//                 password: process.env.DB_PASSWORD || '',
//                 database: company.company_database,
//                 logging: false,
//                 synchronize: false,
//                 entities: ['dist/entity/**/*.js'],
//                 migrations: ['src/migration/companies/*.js'],
//                 subscribers: ['src/subscriber/**/*.ts']
//             })
//             appDataSourceCompany.initialize()
//             .then(() => {
//                 // Realizo creación de la base de datos
//                 appDataSourceCompany.runMigrations();
//             })
//             .catch((err) => {
//                 console.error("Error during Data Source initialization company: ", company.company_database, err)
//             })
//             /////////////////////////////////////////////////////

//             appDataSource.destroy();
//             res.status(201).json({ message: messages.Companies.company_created, data: company });
//         })
//         .catch((err) => {
//             console.error("Error during Data Source initialization:", err)
//             appDataSource.destroy();
//             return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//         })
//     } catch (e) {
//         console.log('CompaniesController.createCompany catch error: ', e);
//         return res.status(500).json({ message: 'error', data: e.name });
//     }
// }

/**
 * Update a company
 * @param req Request object :id { company_name, company_color, company_razon_social, company_id_fiscal, company_email,
            company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
            company_contact_name, company_contact_phone, company_contact_email }
 * @param res Response object
 * @returns
 */
// export const updateCompany = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { authorization } = req.headers; // bearer randomhashjwt
//         const split = authorization.split(' ');
//         const accessToken = split[1] || '';

//         const company_id = req.params.id; // get user id from URL param
//         const { company_name, company_status, company_color, company_razon_social, company_id_fiscal, company_email,
//             company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
//             company_contact_name, company_contact_phone, company_contact_email } = req.body;
//         // Obtengo el usuario en token para comprobar sea user admin
//         const decoded        = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
//         const user  = decoded.user;
//         if (user.is_admin === 0) return res.status(400).json({ message: 'No está autorizado para modificar empresas' });
//         // If company not exists
//         if (!company_id) return res.status(404).json({ message: messages.Companies.company_not_exists });
//         appDataSource
//         .initialize()
//         .then(async () => {
//             const companyRepository = appDataSource.getRepository(Companies);
//             const data = await companyRepository.findOneBy({
//                 company_id: parseInt(company_id)
//             });
//             // If company not exists
//             if (!data) return res.status(404).json({ message: messages.Companies.company_not_exists });

//             // Actualiza los campos del usuario
//             data.company_name = company_name || data.company_name;
//             data.company_status = (company_status == 0 || company_status == 1 ? company_status : data.company_status);
//             data.company_color = company_color || data.company_color;
//             data.company_razon_social = company_razon_social || data.company_razon_social;
//             data.company_id_fiscal = company_id_fiscal || data.company_id_fiscal;
//             data.company_email = company_email || data.company_email;
//             data.company_phone = company_phone || data.company_phone;
//             data.company_phone2 = company_phone2 || data.company_phone2;
//             data.company_website = company_website || data.company_website;
//             data.company_facebook = company_facebook || data.company_facebook;
//             data.company_instagram = company_instagram || data.company_instagram;
//             data.company_url_logo = company_url_logo || data.company_url_logo;
//             data.company_contact_name = company_contact_name || data.company_contact_name;
//             data.company_contact_phone = company_contact_phone || data.company_contact_phone;
//             data.company_contact_email = company_contact_email || data.company_contact_email;
//             data.updated_at = new Date();

//             // Guarda los cambios en la base de datos
//             await companyRepository.save(data);
//             appDataSource.destroy();
//             res.status(200).json({ message: messages.Companies.company_updated, data: data });
//         })
//         .catch((err) => {
//             console.error("Error during Data Source initialization:", err)
//             appDataSource.destroy();
//             return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//         })
//     } catch (e) {
//         console.log('CompanyController.updateCompany catch error: ', e);
//         return res.status(500).json({ message: 'error', data: e.name });
//     }
// }



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