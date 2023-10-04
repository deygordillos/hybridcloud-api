import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import { Companies } from "../entity/companies.entity";
import { Sucursales } from "../entity/sucursales.entity";
import messages from "../config/messages";
import slugify from "slugify";

/**
 * Create a sucursal
 * @param req Request object { sucursal_name, sucursal_color, sucursal_razon_social, sucursal_id_fiscal, sucursal_email, 
 * sucursal_phone, sucursal_phone2, sucursal_website, sucursal_facebook, sucursal_instagram, sucursal_url_logo, sucursal_contact_name,
 * sucursal_contact_phone, sucursal_contact_email, company_id  }
 * @param res Response object
 * @returns 
 */
export const createSucursal = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';

        const { sucursal_name, sucursal_color, sucursal_razon_social, sucursal_id_fiscal, sucursal_email,
            sucursal_phone, sucursal_phone2, sucursal_website, sucursal_facebook, sucursal_instagram, sucursal_url_logo,
            sucursal_contact_name, sucursal_contact_phone, sucursal_contact_email, company_id } = req.body;

        // Obtengo el usuario en token para comprobar sea user admin
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN);
        const user = decoded.user;
        if (user.is_admin === 0) return res.status(400).json({ message: 'No está autorizado para crear sucursales' });
        // Busco si existe la empresa
        const companyRepository = appDataSource.getRepository(Companies);
        const dataCompany = await companyRepository.findOneBy({
            company_id: parseInt(company_id)
        });
        // If company not exists
        if (!dataCompany) return res.status(404).json({ message: messages.Companies.company_not_exists });


        // Creo la sucursal
        const sucursalRepository = appDataSource.getRepository(Sucursales);
        const sucursal = sucursalRepository.create({
            sucursal_name,
            created_at: new Date(),
            updated_at: new Date(),
            sucursal_color,
            sucursal_razon_social,
            sucursal_slug: slugify(sucursal_name).toLocaleLowerCase(),
            sucursal_id_fiscal,
            sucursal_email,
            sucursal_phone,
            sucursal_phone2,
            sucursal_website,
            sucursal_facebook,
            sucursal_instagram,
            sucursal_url_logo,
            sucursal_contact_name,
            sucursal_contact_phone,
            sucursal_contact_email,
            company_id
        });
        await sucursalRepository.save(sucursal);

        res.status(201).json({ message: messages.Sucursales.sucursal_created, data: sucursal });
    } catch (e) {
        console.log('SucursalController.createSucursal catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Update a sucursal
 * @param req Request object :id { group_name, group_status }
 * @param res Response object
 * @returns
 */
export const updateSucursal = async (req: Request, res: Response): Promise<Response> => {
    try {
        const sucursal_id = req.params.id; // get user id from URL param
        const { sucursal_name, sucursal_status, sucursal_color, sucursal_razon_social, sucursal_id_fiscal, sucursal_email,
            sucursal_phone, sucursal_phone2, sucursal_website, sucursal_facebook, sucursal_instagram, sucursal_url_logo,
            sucursal_contact_name, sucursal_contact_phone, sucursal_contact_email } = req.body;
        // If sucursal not exists
        if (!sucursal_id) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });

        const sucursalRepository = appDataSource.getRepository(Sucursales);

        const data = await sucursalRepository.findOneBy({
            sucursal_id: parseInt(sucursal_id)
        });
        // If sucursal not exists
        if (!data) return res.status(404).json({ message: messages.Sucursales.sucursal_not_exists });

        // Actualiza los campos del usuario
        data.sucursal_name = sucursal_name || data.sucursal_name;
        data.sucursal_status = (sucursal_status == 0 || sucursal_status == 1 ? sucursal_status : data.sucursal_status);
        data.sucursal_color = sucursal_color || data.sucursal_color;
        data.sucursal_razon_social = sucursal_razon_social || data.sucursal_razon_social;
        data.sucursal_id_fiscal = sucursal_id_fiscal || data.sucursal_id_fiscal;
        data.sucursal_email = sucursal_email || data.sucursal_email;
        data.sucursal_phone = sucursal_phone || data.sucursal_phone;
        data.sucursal_phone2 = sucursal_phone2 || data.sucursal_phone2;
        data.sucursal_website = sucursal_website || data.sucursal_website;
        data.sucursal_facebook = sucursal_facebook || data.sucursal_facebook;
        data.sucursal_instagram = sucursal_instagram || data.sucursal_instagram;
        data.sucursal_url_logo = sucursal_url_logo || data.sucursal_url_logo;
        data.sucursal_contact_name = sucursal_contact_name || data.sucursal_contact_name;
        data.sucursal_contact_phone = sucursal_contact_phone || data.sucursal_contact_phone;
        data.sucursal_contact_email = sucursal_contact_email || data.sucursal_contact_email;
        data.updated_at = new Date();

        // Guarda los cambios en la base de datos
        await sucursalRepository.save(data);

        res.status(200).json({ message: messages.Sucursales.sucursal_updated, data: data });
    } catch (e) {
        console.log('SucursalController.updateSucursal catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}