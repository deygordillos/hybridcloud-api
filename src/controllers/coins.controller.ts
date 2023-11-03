import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import messages from "../config/messages";
import { In } from "typeorm";
import { Coins } from "../entity/coins.entity";
import { Sucursales } from "../entity/sucursales.entity";
import { Rel_Taxes_Sucursales } from "../entity/rel_taxes_sucursales.entity";

export const findAllCoins = async (req: Request, res: Response): Promise<Response> => {
    try {
        let offset = (req.query.hasOwnProperty("offset")) ? parseInt(req.query.offset.toString()) : 0;
        let limit = (req.query.hasOwnProperty("limit")) ? parseInt(req.query.limit.toString()) : 10;
        if (limit > 1000) limit = 1000;

        appDataSource
        .initialize()
        .then(async () => {
            const coinsList = await appDataSource.createQueryBuilder(Coins, "coin")
            .select([
                "coin_id", 
                "coin_name", 
                "coin_symbol", 
                "coin_factor",
                "coin_iso3"
            ])
            .where({
                coin_status: 1
            })
            .offset(offset)
            .limit(limit)
            .getRawMany();

            const total = await appDataSource.createQueryBuilder(Coins, "coin")
            .where({
                coin_status: 1
            })
            .getCount();

            res.send({ code: 200, message: 'Coins founded', recordsTotal: total, recordsFiltered: coinsList.length, data: coinsList });
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
 * Assign tax to a sucursal
 * @param req Request object :id { sucursal_id: [] }
 * @param res Response object
 * @returns 
 */
// export const assignTaxToSucursales = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const tax_id = req.params.id; // get user id from URL param
//         const { sucursal_id } = req.body;
//         if (!tax_id) return res.status(400).json({ message: messages.Tax.tax_needed });

//         const { authorization } = req.headers; // bearer randomhashjwt
//         const split = authorization.split(' ');
//         const accessToken = split[1] || '';
//         if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});

//         const decoded  = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
//         const jwtdata  = decoded.user;

//         appDataSource
//         .initialize()
//         .then(async () => {
//             const taxesRepository = appDataSource.getRepository(Taxes);
//             const taxData = await taxesRepository.findOneBy({
//                 tax_id: parseInt(tax_id)
//             });
//             console.log(taxData)
//             // If tax not exists
//             if (!taxData) return res.status(404).json({ message: messages.User.user_not_exists });

//             const sucursalRepository = appDataSource.getRepository(Sucursales);
//             const sucursalData = await sucursalRepository.find({
//                 where: {
//                     sucursal_id: In(sucursal_id),
//                     company_id: jwtdata.company_id
//                 }
//             });

//             // If sucursales not exists
//             if (!sucursalData || sucursalData.length == 0) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });

//             const relTaxesSucRepository = appDataSource.getRepository(Rel_Taxes_Sucursales);
//             const queryRunner = appDataSource.createQueryRunner()
//             try {
//                 await queryRunner.startTransaction()
//                 const promises = sucursalData.map(async (sucursal) => {
//                     const relTaxSuc = new Rel_Taxes_Sucursales();
//                     relTaxSuc.taxes = taxData;
//                     relTaxSuc.sucursales = sucursal;
//                     await relTaxesSucRepository.save(relTaxSuc);
//                 });
//                 await Promise.all(promises);
//                 await queryRunner.commitTransaction(); // Confirmar la transacción
//                 console.log("Todas las inserciones exitosas");
//                 res.status(200).json({ message: messages.Tax.tax_updated });
//             } catch (error) {
//                 console.error("Error al insertar: ", error);
//                 await queryRunner.rollbackTransaction(); // Revertir la transacción en caso de error
//                 res.status(500).json({ message: 'Error al guardar los datos.' });
//             } finally {
//                 await queryRunner.release(); // Liberar la transacción y la conexión
//             }
//         })
//         .catch((err) => {
//             console.error("Error during Data Source initialization:", err)
//             return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
//         })
//         .finally(() => {
//             appDataSource.destroy();
//         })
//     } catch (e) {
//         console.log('TaxController.assignTaxToSucursales catch error: ', e);
//         return res.status(500).json({ message: 'error', data: e.name });
//     }
// }