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
        const decoded        = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const user  = decoded.user;
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