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
 * Update a company
 * @param req Request object :id { company_name, company_color, company_razon_social, company_id_fiscal, company_email,
            company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
            company_contact_name, company_contact_phone, company_contact_email }
 * @param res Response object
 * @returns
 */
export const updateCompany = async (req: Request, res: Response): Promise<Response> => {
    try {
        const company_id = req.params.id; // get user id from URL param
        const { company_name, company_status, company_color, company_razon_social, company_id_fiscal, company_email,
            company_phone, company_phone2, company_website, company_facebook, company_instagram, company_url_logo,
            company_contact_name, company_contact_phone, company_contact_email, country_id, group_id } = req.body;
        // If sucursal not exists
        if (!company_id) return res.status(400).json({ message: messages.Companies.company_not_exists });

        const companyRepository = appDataSource.getRepository(Companies);
        const data = await companyRepository.findOneBy({
            company_id: parseInt(company_id)
        });
        // If company not exists
        if (!data) return res.status(404).json({ message: messages.Companies.company_not_exists });

        // Actualiza los campos del usuario
        data.company_name = company_name || data.company_name;
        data.company_status = (company_status == 0 || company_status == 1 ? company_status : data.company_status);
        data.company_color = company_color || data.company_color;
        data.company_razon_social = company_razon_social || data.company_razon_social;
        data.company_id_fiscal = company_id_fiscal || data.company_id_fiscal;
        data.company_email = company_email || data.company_email;
        data.company_phone = company_phone || data.company_phone;
        data.company_phone2 = company_phone2 || data.company_phone2;
        data.company_website = company_website || data.company_website;
        data.company_facebook = company_facebook || data.company_facebook;
        data.company_instagram = company_instagram || data.company_instagram;
        data.company_url_logo = company_url_logo || data.company_url_logo;
        data.company_contact_name = company_contact_name || data.company_contact_name;
        data.company_contact_phone = company_contact_phone || data.company_contact_phone;
        data.company_contact_email = company_contact_email || data.company_contact_email;
        data.updated_at = new Date();

        // Guarda los cambios en la base de datos
        await companyRepository.save(data);
        res.status(200).json({ message: messages.Companies.company_updated, data: data });
    } catch (e) {
        console.log('CompanyController.updateCompany catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}