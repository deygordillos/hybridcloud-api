import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import messages from "../config/messages";
import { In } from "typeorm";
import { Coins } from "../entity/coins.entity";
import { Companies } from "../entity/companies.entity";
import { Rel_Coins_Companies } from "../entity/rel_coins_companies.entity";
// import { Sucursales } from "../entity/sucursales.entity";
import { Rel_Coins_Companies_Sucursal } from "../entity/rel_coins_companies_sucursal.entity";

export const findAllCoins = async (req: Request, res: Response): Promise<Response> => {
    try {
        let offset = (req.query.hasOwnProperty("offset")) ? parseInt(req.query.offset.toString()) : 0;
        let limit = (req.query.hasOwnProperty("limit")) ? parseInt(req.query.limit.toString()) : 10;
        let company_id = (req.query.hasOwnProperty("company_id")) ? parseInt(req.query.company_id.toString()) : 0;
        if (limit > 1000) limit = 1000;

        appDataSource
        .initialize()
        .then(async () => {
            const coinsList = await appDataSource.createQueryBuilder(Coins, "coin")
            .leftJoinAndSelect(Rel_Coins_Companies, "rcc", "rcc.coin_id = coin.coin_id AND rcc.company_id = :company_id", {company_id})
            .select([
                "coin.coin_id as coin_id", 
                "coin.coin_name as coin_name", 
                "coin.coin_symbol as coin_symbol", 
                "coin.coin_factor as coin_factor",
                "coin.coin_iso3 as coin_iso3",
                "IF(rcc.id_coin_company IS NULL, 0, 1) AS coin_company_active"
            ])
            .where("coin.coin_status = :coin_status", { coin_status: 1 })
            .offset(offset)
            .limit(limit)
            .groupBy("coin.coin_id")
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
 * Assign coin to company
 * @param req Request object { coins: [{id: 1, factor: 100.0}] }
 * @param res Response object
 * @returns 
 */
export const assignCoinsToCompanies = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { company_id } = req.params; // get coin & company_id by param
        const { coins } = req.body;
        console.log({coins});
        // If company not exists
        if (!company_id) return res.status(404).json({ message: messages.Companies.company_not_exists });
        
        appDataSource
        .initialize()
        .then(async () => {
            const idCoins = coins.map(coin => coin.id); // mapeo de id coins
            // Obtengo la data de la empresa en sesión
            const companyRepository = appDataSource.getRepository(Companies);
            const companyData = await companyRepository.findOneBy({
                company_id: parseInt(company_id)
            });
            // If company not exists
            if (!companyData) return res.status(400).json({ message: messages.Companies.company_not_exists });
            // Obtengo las monedas válidas en json body coins
            const coinsRepository = appDataSource.getRepository(Coins);
            const coinsData = await coinsRepository.find({
                where: {
                    coin_id: In(idCoins)
                }
            });

            const repositoryCoinsCompany = appDataSource.getRepository(Rel_Coins_Companies);
            const queryRunner = appDataSource.createQueryRunner()
            // try {
            //     await queryRunner.startTransaction()
            //     const promises = coinsData.map(async (coinData) => {
            //         const { coin_id } = coinData; 
            //         const datafactor = coins.find(coin => coin.id == coin_id); // obtengo el factor ingresado por body
                    
            //         const relCoinCompany = new Rel_Coins_Companies();
            //         relCoinCompany.coins = coinData;
            //         relCoinCompany.companies = companyData;
            //         relCoinCompany.coin_factor = parseFloat(datafactor.factor);
            //         await repositoryCoinsCompany.save(relCoinCompany);
            //     });
            //     await Promise.all(promises);
            //     await queryRunner.commitTransaction(); // Confirmar la transacción
            //     console.log("Todas las inserciones exitosas");
            //     res.status(200).json({ message: messages.Coins.coins_assigned });
            // } catch (error) {
            //     console.error("Error al insertar: ", error);
            //     await queryRunner.rollbackTransaction(); // Revertir la transacción en caso de error
            //     res.status(500).json({ message: 'Error al guardar los datos.' });
            // } finally {
            //     await queryRunner.release(); // Liberar la transacción y la conexión
            // }
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

/**
 * Assign coin to sucursal
 * @param req Request params { coin_id, company_id } --- body object { sucursal_id: [1,2,3] }
 * @param res Response object
 * @returns 
 */
export const assignCoinsToSucursales = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { coin_id, company_id } = req.params; // get coin & company_id by param
        const { sucursal_id } = req.body;
        console.log({sucursal_id});

        appDataSource
        .initialize()
        .then(async () => {
            // Obtengo la data de la empresa por parámetro
            const companyRepository = appDataSource.getRepository(Companies);
            const companyData = await companyRepository.findOneBy({
                company_id: parseInt(company_id)
            });
            // If company not exists
            if (!companyData) return res.status(400).json({ message: messages.Companies.company_not_exists });
            // Obtengo las monedas válidas en json body coins
            const coinsRepository = appDataSource.getRepository(Coins);
            const coinsData = await coinsRepository.findOneBy({
                coin_id: parseInt(coin_id)
            });
            if (!coinsData) return res.status(400).json({ message: messages.Coins.coin_not_exists });

            const repositoryCoinsCompany = appDataSource.getRepository(Rel_Coins_Companies);
            const coinCompanyData = await repositoryCoinsCompany.findOneBy({
                coin_id: parseInt(coin_id),
                company_id: parseInt(company_id)
            });
            if (!coinCompanyData) return res.status(404).json({ message: messages.Coins.coin_not_exists });

            console.log("assignCoinsToSucursales.coinCompanyData:", coinCompanyData);

            // Busco si las sucursales ingresadas son sucursales de la empresa
            // const sucursalRepository = appDataSource.getRepository(Sucursales);
            // const sucursalData = await sucursalRepository.find({
            //     where: {
            //         company_id: parseInt(company_id),
            //         sucursal_id: In(sucursal_id)
            //     }
            // });
            // // If sucursales not exists
            // if (!sucursalData || sucursalData.length == 0) return res.status(400).json({ message: messages.Sucursales.sucursal_not_exists });


            const repositoryCoinsCompanySucursal = appDataSource.getRepository(Rel_Coins_Companies_Sucursal);
            const queryRunner = appDataSource.createQueryRunner()
            // try {
            //     await queryRunner.startTransaction()
            //     const promises = sucursalData.map(async (sucData) => {
            //         const relCoinCompanySuc = new Rel_Coins_Companies_Sucursal();
            //         relCoinCompanySuc.sucursales = sucData;
            //         relCoinCompanySuc.coins_companies = coinCompanyData;
            //         relCoinCompanySuc.created_at = new Date();
            //         await repositoryCoinsCompanySucursal.save(relCoinCompanySuc);
            //     });
            //     await Promise.all(promises);
            //     await queryRunner.commitTransaction(); // Confirmar la transacción
            //     console.log("Todas las inserciones exitosas");
            //     res.status(200).json({ message: messages.Coins.coins_assigned });
            // } catch (error) {
            //     console.error("Error al insertar: ", error);
            //     await queryRunner.rollbackTransaction(); // Revertir la transacción en caso de error
            //     res.status(500).json({ message: 'Error al guardar los datos.' });
            // } finally {
            //     await queryRunner.release(); // Liberar la transacción y la conexión
            // }
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
            return res.status(500).json({ message: 'Ups! Parece tuvimos un inconveniente. Intente nuevamente.' });
        })
        .finally(() => {
            appDataSource.destroy();
        })
    } catch (e) {
        console.log('CoinsController.assignCoinsToSucursales catch error: ', e);
        return res.status(500).json({ message: 'error', data: e.name });
    }
}