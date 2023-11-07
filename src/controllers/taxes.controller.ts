import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import messages from "../config/messages";
import { In } from "typeorm";
import { Taxes } from "../entity/taxes.entity";
import { Sucursales } from "../entity/sucursales.entity";
import { Rel_Taxes_Sucursales } from "../entity/rel_taxes_sucursales.entity";

export const findAllTaxes = async (req: Request, res: Response): Promise<Response> => {
    try {
        let tax_status = (req.query.hasOwnProperty("tax_status")) ? parseInt(req.query.tax_status.toString()) : 1;
        let offset = (req.query.hasOwnProperty("offset")) ? parseInt(req.query.offset.toString()) : 0;
        let limit = (req.query.hasOwnProperty("limit")) ? parseInt(req.query.limit.toString()) : 10;
        if (limit > 1000) limit = 1000;

        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';
        if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});
        const decoded  = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const jwtdata  = decoded.user;

        appDataSource
        .initialize()
        .then(async () => {
            // Creo el impuesto
            const taxesList = await appDataSource.createQueryBuilder(Taxes, "tax")
            .select([
                "tax_id", 
                "tax_code", 
                "tax_description", 
                "tax_siglas", 
                "IF(tax_status = 1, 'Activo', 'Inactivo') as tax_status",
                "IF(tax_type = 1, 'Execto', 'Afecto') as tax_type",
                "IF(tax_affects_cost = 1, 'Afecta costo', 'No afecta costo') as tax_affects_cost", 
                "tax_percentage"
            ])
            .where({
                company_id: jwtdata.company_id,
                tax_status: tax_status
            })
            .offset(offset)
            .limit(limit)
            .getRawMany();

            const total = await appDataSource.createQueryBuilder(Taxes, "tax")
            .where({
                company_id: jwtdata.company_id,
                tax_status: tax_status
            })
            .getCount();

            res.send({ code: 200, message: 'Taxes founded', recordsTotal: total, recordsFiltered: taxesList.length, data: taxesList });
        })
        .catch((err) => {
            console.error("appDataSource. Error during Data Source initialization:", err.sqlMessage)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            if (appDataSource.isInitialized) appDataSource.destroy();
        });

    } catch (e) {
        console.log({ e });
        return res.status(503).send({ message: 'error', data: e });
    }
}

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
            if (taxDataExists) return res.status(404).json({ message: messages.Tax.tax_exists });

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
            if (!data) return res.status(404).json({ message: messages.Tax.tax_not_exists });

            // Actualiza los campos del usuario
            data.tax_description = tax_description || data.tax_description;
            data.tax_siglas = tax_siglas || data.tax_siglas;
            data.tax_type = tax_type || data.tax_type;
            data.tax_percentage = tax_percentage || data.tax_percentage;
            data.tax_affects_cost = (tax_affects_cost == 1 || tax_affects_cost == 0 ? tax_affects_cost : data.tax_affects_cost);
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

/**
 * Assign tax to a sucursal
 * @param req Request object :id { sucursal_id: [] }
 * @param res Response object
 * @returns 
 */
export const assignTaxToSucursales = async (req: Request, res: Response): Promise<Response> => {
    try {
        const tax_id = req.params.id; // get user id from URL param
        const { sucursal_id } = req.body;
        if (!tax_id) return res.status(400).json({ message: messages.Tax.tax_needed });

        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';
        if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});

        const decoded  = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const jwtdata  = decoded.user;

        appDataSource
        .initialize()
        .then(async () => {
            const taxesRepository = appDataSource.getRepository(Taxes);
            const taxData = await taxesRepository.findOneBy({
                tax_id: parseInt(tax_id)
            });
            console.log(taxData)
            // If tax not exists
            if (!taxData) return res.status(404).json({ message: messages.User.user_not_exists });

            const sucursalRepository = appDataSource.getRepository(Sucursales);
            const sucursalData = await sucursalRepository.find({
                where: {
                    sucursal_id: In(sucursal_id),
                    company_id: jwtdata.company_id
                }
            });

            // If sucursales not exists
            if (!sucursalData || sucursalData.length == 0) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });

            const relTaxesSucRepository = appDataSource.getRepository(Rel_Taxes_Sucursales);
            const queryRunner = appDataSource.createQueryRunner()
            try {
                await queryRunner.startTransaction()
                const promises = sucursalData.map(async (sucursal) => {
                    const relTaxSuc = new Rel_Taxes_Sucursales();
                    relTaxSuc.taxes = taxData;
                    relTaxSuc.sucursales = sucursal;
                    await relTaxesSucRepository.save(relTaxSuc);
                });
                await Promise.all(promises);
                await queryRunner.commitTransaction(); // Confirmar la transacción
                console.log("Todas las inserciones exitosas");
                res.status(200).json({ message: messages.Tax.tax_updated });
            } catch (error) {
                console.error("Error al insertar: ", error);
                await queryRunner.rollbackTransaction(); // Revertir la transacción en caso de error
                res.status(500).json({ message: 'Error al guardar los datos.' });
            } finally {
                await queryRunner.release(); // Liberar la transacción y la conexión
            }
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('TaxController.assignTaxToSucursales catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}