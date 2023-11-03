import { Request, Response } from "express";
import { appDataSource } from "../app-data-source";
import 'dotenv/config';
import jwt from "jsonwebtoken";
import messages from "../config/messages";
import { In } from "typeorm";
import { Coins } from "../entity/coins.entity";
import { Companies } from "../entity/companies.entity";
import { Rel_Coins_Companies } from "../entity/rel_coins_companies.entity";

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
 * Assign coin to company
 * @param req Request object { coins: [{id: 1, factor: 100.0}] }
 * @param res Response object
 * @returns 
 */
export const assignCoinsToCompanies = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { coins } = req.body;
        console.log({coins});

        const { authorization } = req.headers; // bearer randomhashjwt
        const split = authorization.split(' ');
        const accessToken = split[1] || '';
        if (!accessToken) return res.status(401).json({ message: 'Access Denied. No token provided.'});
        const decoded  = jwt.verify(accessToken,  process.env.JWT_ACCESS_TOKEN);
        const jwtdata  = decoded.user;

        appDataSource
        .initialize()
        .then(async () => {
            const idCoins = coins.map(coin => coin.id); // mapeo de id coins
            // Obtengo la data de la empresa en sesión
            const companyRepository = appDataSource.getRepository(Companies);
            const companyData = await companyRepository.findOneBy({
                company_id: parseInt(jwtdata.company_id)
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
            try {
                await queryRunner.startTransaction()
                const promises = coinsData.map(async (coinData) => {
                    const { coin_id } = coinData; 
                    const datafactor = coins.find(coin => coin.id == coin_id); // obtengo el factor ingresado por body
                    
                    const relCoinCompany = new Rel_Coins_Companies();
                    relCoinCompany.coins = coinData;
                    relCoinCompany.companies = companyData;
                    relCoinCompany.coin_factor = parseFloat(datafactor.factor);
                    await repositoryCoinsCompany.save(relCoinCompany);
                });
                await Promise.all(promises);
                await queryRunner.commitTransaction(); // Confirmar la transacción
                console.log("Todas las inserciones exitosas");
                res.status(200).json({ message: messages.Coins.coins_assigned });
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