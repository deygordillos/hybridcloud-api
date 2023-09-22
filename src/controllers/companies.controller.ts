import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import { Countries } from "../entity/countries.entity";
import { Groups } from "../entity/groups.entity";
import { Companies } from "../entity/companies.entity";
import messages from "../config/messages";
import slugify from "slugify";

/**
 * Create a company
 * @param req Request object { company_name, company_color, company_razon_social, company_id_fiscal, company_email, 
 * company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo, company_contact_name,
 * company_contact_phone, company_contact_email, country_id, group_id  }
 * @param res Response object
 * @returns 
 */
export const createCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';

        const { company_name, company_color, company_razon_social, company_id_fiscal, company_email,
            company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
            company_contact_name, company_contact_phone, company_contact_email, country_id, group_id } = req.body;

        // Obtengo el usuario en token para comprobar sea user admin
        const decoded        = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const user  = decoded.user;
        if (user.is_admin === 0) return res.status(400).json({ message: 'No está autorizado para crear grupos' });
        // Busco si existe el grupo
        const groupRepository = appDataSource.getRepository(Groups);
        const dataGroup = await groupRepository.findOneBy({
            group_id: parseInt(group_id)
        });
        // If group not exists
        if (!dataGroup) return res.status(404).json({ message: messages.Groups.group_not_exists });

        const countryRepository = appDataSource.getRepository(Countries);
        const dataCountry = await countryRepository.findOneBy({
            country_id: parseInt(country_id)
        });
        // If country not exists
        if (!dataCountry) return res.status(404).json({ message: messages.Country.country_not_exists });

        // Creo la empresa
        const companyRepository = appDataSource.getRepository(Companies);
        const group = companyRepository.create({
            company_name,
            created_at: new Date(),
            updated_at: new Date(),
            company_color,
            company_razon_social,
            company_slug: slugify(company_name).toLocaleLowerCase(),
            company_id_fiscal,
            company_email,
            company_phone,
            company_phone2,
            company_website,
            company_facebook,
            company_instagram,
            company_database: company_name,
            company_url_logo,
            company_contact_name,
            company_contact_phone,
            company_contact_email,
            country_id,
            group_id
        });
        await companyRepository.save(group);

        res.status(201).json({ message: messages.Groups.group_created, data: group });
    } catch (e) {
        console.log('CompaniesController.createCompany catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Update a group
 * @param req Request object :id { group_name, group_status }
 * @param res Response object
 * @returns
 */
// export const updateGroup = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const group_id = req.params.id; // get user id from URL param
//         const { group_name, group_status } = req.body;
//         console.log(typeof group_id)
//         // If group not exists
//         if (!group_id) return res.status(400).json({ message: messages.Groups.group_needed });

//         const groupRepository = appDataSource.getRepository(Groups);

//         const data = await groupRepository.findOneBy({
//             group_id: parseInt(group_id)
//         });
//         // If group not exists
//         if (!data) return res.status(404).json({ message: messages.Groups.group_not_exists });

//         // Actualiza los campos del usuario
//         data.group_name   = group_name || data.group_name;
//         data.group_status = (group_status == 0 || group_status == 1 ? group_status : data.group_status);
//         data.updated_at = new Date();

//         // Guarda los cambios en la base de datos
//         await groupRepository.save(data);

//         res.status(200).json({ message: messages.Groups.group_updated, data: data });
//     } catch (e) {
//         console.log('GroupController.updateGroup catch error: ', e);
//         return res.status(500).json({ message: 'error', data: e.name });
//     }
// }