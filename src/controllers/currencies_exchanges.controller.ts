import { Request, Response } from "express";
import { CurrenciesExchangesService } from "../services/CurrenciesExchangesService";
import { successResponse, errorResponse } from "../helpers/responseHelper";
import messages from "../config/messages";

export class CurrenciesExchangesController {
    /**
     * Get all currencies for a company
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getCompanyCurrencies(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return errorResponse(res, messages.CurrenciesExchanges.company_id_required, 400);
            
            const currencies = await CurrenciesExchangesService.getCompanyCurrencies(company_id);
            return successResponse(res, messages.CurrenciesExchanges.currencies_retrieved, 200, currencies);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error fetching company currencies:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error fetching company currencies:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Get currency by ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getCurrencyById(req: Request, res: Response) {
        try {
            const currency_exc_id = parseInt(req.params.id, 10) || 0;
            if (!currency_exc_id) return errorResponse(res, messages.CurrenciesExchanges.currency_exchange_needed, 400);
            if (isNaN(currency_exc_id)) return errorResponse(res, messages.CurrenciesExchanges.invalid_currency_exchange_id, 400);

            const currency = await CurrenciesExchangesService.getCurrencyById(currency_exc_id);
            if (!currency) {
                return errorResponse(res, messages.CurrenciesExchanges.currency_exchange_not_exists, 404);
            }

            return successResponse(res, messages.CurrenciesExchanges.currency_exchange_retrieved, 200, currency);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error fetching currency:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error fetching currency:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Create a new currency exchange
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return errorResponse(res, messages.CurrenciesExchanges.company_id_required, 400);

            const { 
                currency_id, 
                currency_exc_rate, 
                currency_exc_type, 
                exchange_method, 
                currency_exc_status 
            } = req.body;

            // Validate required fields
            if (!currency_id) return errorResponse(res, messages.CurrenciesExchanges.currency_id_required, 400);
            if (!currency_exc_rate) return errorResponse(res, messages.CurrenciesExchanges.exchange_rate_required, 400);
            if (!currency_exc_type) return errorResponse(res, messages.CurrenciesExchanges.currency_type_required, 400);

            const currencyData = {
                company_id,
                currency_id: parseInt(currency_id),
                currency_exc_rate: parseFloat(currency_exc_rate),
                currency_exc_type: parseInt(currency_exc_type),
                exchange_method: exchange_method || 2, // 2 = MULTIPLY
                currency_exc_status: currency_exc_status || 1
            };

            const currency = await CurrenciesExchangesService.create(company_id, currencyData);

            return successResponse(res, messages.CurrenciesExchanges.currency_exchange_created, 201, currency);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error creating currency exchange:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error creating currency exchange:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Update a currency exchange
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const currency_exc_id = parseInt(req.params.id, 10) || 0;
            if (!currency_exc_id) return errorResponse(res, messages.CurrenciesExchanges.currency_exchange_needed, 400);
            if (isNaN(currency_exc_id)) return errorResponse(res, messages.CurrenciesExchanges.invalid_currency_exchange_id, 400);

            const currency = await CurrenciesExchangesService.getCurrencyById(currency_exc_id);
            if (!currency) {
                return errorResponse(res, messages.CurrenciesExchanges.currency_exchange_not_exists, 404);
            }

            const response = await CurrenciesExchangesService.update(currency_exc_id, req.body);
            return successResponse(res, messages.CurrenciesExchanges.currency_exchange_updated, 200, response);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error updating currency exchange:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error updating currency exchange:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Convert amount between currencies
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async convertCurrency(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return errorResponse(res, messages.CurrenciesExchanges.company_id_required, 400);

            const { 
                from_currency_id, 
                to_currency_id, 
                amount 
            } = req.body;

            // Validate required fields
            if (!from_currency_id) return errorResponse(res, messages.CurrenciesExchanges.from_currency_id_required, 400);
            if (!to_currency_id) return errorResponse(res, messages.CurrenciesExchanges.to_currency_id_required, 400);
            if (!amount || amount <= 0) return errorResponse(res, messages.CurrenciesExchanges.amount_required, 400);

            const result = await CurrenciesExchangesService.convertCurrency(
                company_id,
                parseInt(from_currency_id),
                parseInt(to_currency_id),
                parseFloat(amount)
            );

            const conversionData = {
                from_currency_id: parseInt(from_currency_id),
                to_currency_id: parseInt(to_currency_id),
                original_amount: parseFloat(amount),
                converted_amount: result.converted_amount,
                exchange_rate: result.exchange_rate,
                exchange_method: result.exchange_method
            };

            return successResponse(res, messages.CurrenciesExchanges.currency_conversion_completed, 200, conversionData);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error converting currency:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error converting currency:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Get currency exchange history
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getCurrencyHistory(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return errorResponse(res, messages.CurrenciesExchanges.company_id_required, 400);

            const currency_id = req.query.currency_id ? parseInt(req.query.currency_id as string) : null;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            if (page < 1 || limit < 1) {
                return errorResponse(res, messages.CurrenciesExchanges.invalid_pagination_params, 400);
            }

            const offset = (page - 1) * limit;
            const { total, history } = await CurrenciesExchangesService.getCurrencyHistory(
                company_id, 
                currency_id, 
                offset, 
                limit
            );

            const totalPages = Math.ceil(total / limit);

            const paginationData = {
                totalRecords: total,
                history,
                currentPage: page,
                totalPages,
                perPage: limit,
            };

            return successResponse(res, messages.CurrenciesExchanges.currency_history_retrieved, 200, paginationData, {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error fetching currency history:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error fetching currency history:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Set base currency for company
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async setBaseCurrency(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return errorResponse(res, messages.CurrenciesExchanges.company_id_required, 400);

            const { currency_id } = req.body;
            if (!currency_id) return errorResponse(res, messages.CurrenciesExchanges.currency_id_required, 400);

            await CurrenciesExchangesService.setBaseCurrency(company_id, parseInt(currency_id));

            return successResponse(res, messages.CurrenciesExchanges.base_currency_set, 200);
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error setting base currency:", error.message, error.stack);
                return errorResponse(res, error.message, 400);
            }
            console.error("Error setting base currency:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }
} 