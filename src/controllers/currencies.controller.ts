import { Request, Response } from "express";
import { CurrenciesService } from "../services/CurrenciesService";

export class CurrenciesController {
    /**
     * List currencies catalog
     * @param req Request object
     * @param res Response object
     */
    static async getCurrencies(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 100;
            const status = req.query?.status !== undefined ? Number(req.query.status) : 1;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const offset = (page - 1) * limit;
            const { data, total } = await CurrenciesService.getCurrencies(offset, limit, status);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Currencies found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });
        } catch (e) {
            console.error('CurrenciesController.getCurrencies catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.name ?? e });
        }
    }
}
