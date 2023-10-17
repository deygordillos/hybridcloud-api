import { Request, Response } from "express";
import { appDataSource, appDataSourceCompany } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import messages from "../config/messages";
import { Taxes } from "../entity/taxes.entity";
import { Companies } from "../entity/companies.entity";

/**
 * Create a tax
 * @param req Request object { tax_code, tax_description, tax_siglas, tax_type, tax_percentage, tax_affects_cost } 
 * @param res Response object
 * @returns 
 */
export const createTax = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';
        if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});

        const decoded  = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const jwtdata  = decoded.user;

        const { tax_code, tax_description, tax_siglas, tax_type, tax_percentage, tax_affects_cost } = req.body;
        appDataSource
        .initialize()
        .then(async () => {
            // Creo el impuesto
            const taxDataExists = await appDataSource.manager.findOneBy(Taxes, {
                company_id: jwtdata.company_id,
                tax_code
            });
            // If tax exists
            if (taxDataExists) return res.status(400).json({ message: messages.Tax.tax_exists });

            const taxRepository = appDataSource.getRepository(Taxes);
            const tax = taxRepository.create({ tax_code, tax_description, tax_siglas, tax_type, tax_percentage, tax_affects_cost, company_id: jwtdata.company_id, created_at: new Date() });
            await taxRepository.save(tax);

            res.status(201).json({ message: messages.Tax.tax_created, data: tax });
        
        })
        .catch((err) => {
            console.error("appDataSource. Error during Data Source initialization:", err.sqlMessage)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            if (appDataSource.isInitialized) appDataSource.destroy();
        });
    } catch (e) {
        console.log('TaxController.create catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}

/**
 * Update a tax
 * @param req Request object :id { tax_description, tax_siglas, tax_status, tax_type, tax_percentage, tax_affects_cost } 
 * @param res Response object
 * @returns 
 */
export const updateTax = async (req: Request, res: Response): Promise<Response> => {
    try {
        const tax_id = req.params.id; // get id from URL param
        const { tax_description, tax_siglas, tax_status, tax_type, tax_percentage, tax_affects_cost }  = req.body;
        if (!tax_id) return res.status(400).json({ message: messages.Tax.tax_needed });

        appDataSource
        .initialize()
        .then(async () => {
            const taxRepository = appDataSource.getRepository(Taxes);
            const data = await taxRepository.findOneBy({
                tax_id: parseInt(tax_id)
            });
            // If tax not exists
            if (!data) return res.status(400).json({ message: messages.Tax.tax_not_exists });

            // Actualiza los campos del usuario
            data.tax_description = tax_description || data.tax_description;
            data.tax_siglas = tax_siglas || data.tax_siglas;
            data.tax_type = tax_type || data.tax_type;
            data.tax_percentage = tax_percentage || data.tax_percentage;
            data.tax_affects_cost = (tax_affects_cost == 1 || tax_affects_cost == 2 ? tax_affects_cost : data.tax_affects_cost);
            data.tax_status = (tax_status == 0 || tax_status == 1 ? tax_status : data.tax_status);
            data.updated_at = new Date();
            
            // Guarda los cambios en la base de datos
            await taxRepository.save(data);
            res.status(200).json({ message: messages.Tax.tax_updated, data: data });
        
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('TaxController.update catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}