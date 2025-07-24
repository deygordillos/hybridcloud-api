import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryPricesService } from "../services/InventoryPricesService";
import { TypesOfPricesService } from "../services/TypesOfPricesService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class InventoryPricesController {
    /**
     * Get inventory prices by variant ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getPricesByVariantId(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const variant = await InventoryVariantsService.findById(inv_var_id);
            if (!variant) return errorResponse(res, "Variant not found", 404);
            
            const offset = (page - 1) * limit;
            const { data, total } = await InventoryPricesService.getPricesByVariantId(inv_var_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Inventory prices found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving inventory prices', 503, e);
        }
    }

    /**
     * Get current prices by variant ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getCurrentPricesByVariantId(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);

            const data = await InventoryPricesService.getCurrentPricesByVariantId(inv_var_id);

            return successResponse(res, 'Current inventory prices found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving current inventory prices', 503, e);
        }
    }

    /**
     * Get prices by variant ID and type
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getPricesByVariantAndType(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            const typeprice_id = parseInt(req.params.typeId, 10);
            
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);
            if (!typeprice_id) return errorResponse(res, "Type price ID is required", 400);

            const data = await InventoryPricesService.getPricesByVariantAndType(inv_var_id, typeprice_id);

            return successResponse(res, 'Inventory prices found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving inventory prices', 503, e);
        }
    }

    /**
     * Create an inventory price
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const data = req.body;

            // Validate required fields
            if (!data.inv_var_id || !data.typeprice_id) {
                return errorResponse(res, "Variant ID and Type Price ID are required", 400);
            }
            if (!data.currency_id_stable) {
                data.currency_id_stable = data.currency_id_ref || (data.currency_id_local || 1)
            }

            // Check if variant exists
            const variant = await InventoryVariantsService.findById(data.inv_var_id);
            if (!variant) {
                return errorResponse(res, "Inventory variant does not exist", 404);
            }

            // Check if type of price exists
            const typeOfPrice = await TypesOfPricesService.findById(data.typeprice_id);
            if (!typeOfPrice) {
                return errorResponse(res, "Type of price does not exist", 404);
            }

            // Check if price already exists for this variant and type
            const existingPrice = await InventoryPricesService.findPriceByVariantAndType(
                data.inv_var_id, 
                data.typeprice_id
            );
            if (existingPrice) {
                return errorResponse(res, 
                    messages.InventoryPrices?.price_exists ?? "Price already exists for this variant and type", 
                    400
                );
            }

            const price = await InventoryPricesService.create(data, user_id);

            return successResponse(res, 
                messages.InventoryPrices?.price_created ?? "Inventory price created", 
                201, 
                price
            );
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryPricesController.create catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryPricesController.create catch error: ', e);
                return errorResponse(res, e?.message || 'Error creating inventory price', 500);
            }
        }
    }

    /**
     * Update an inventory price
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const inv_price_id = parseInt(req.params.id, 10);
            if (!inv_price_id) return errorResponse(res, 
                messages.InventoryPrices?.price_needed ?? "Inventory price ID is required", 
                400
            );

            const price = await InventoryPricesService.findPriceById(inv_price_id);
            if (!price) return errorResponse(res, 
                messages.InventoryPrices?.price_not_exists ?? "Inventory price does not exist", 
                404
            );

            // If typeprice_id is being updated, check if it exists
            if (req.body.typeprice_id) {
                const typeOfPrice = await TypesOfPricesService.findById(req.body.typeprice_id);
                if (!typeOfPrice) {
                    return errorResponse(res, "Type of price does not exist", 404);
                }
            }

            const response = await InventoryPricesService.update(price, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryPricesController.update catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryPricesController.update catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating inventory price', 500);
            }
        }
    }

    /**
     * Delete an inventory price
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    // static async delete(req: Request, res: Response) {
    //     try {
    //         const inv_price_id = parseInt(req.params.id, 10);
    //         if (!inv_price_id) return errorResponse(res, 
    //             messages.InventoryPrices?.price_needed ?? "Inventory price ID is required", 
    //             400
    //         );

    //         const response = await InventoryPricesService.delete(inv_price_id);

    //         return successResponse(res, response.message, 200);
    //     } catch (e) {
    //         if (e instanceof Error) {
    //             console.error('InventoryPricesController.delete catch error: ', e.message, e.stack);
    //             return errorResponse(res, e.message, 400);
    //         } else {
    //             console.error('InventoryPricesController.delete catch error: ', e);
    //             return errorResponse(res, e?.message || 'Error deleting inventory price', 500);
    //         }
    //     }
    // }

    /**
     * Set price as current
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async setAsCurrent(req: Request, res: Response) {
        try {
            const inv_price_id = parseInt(req.params.id, 10);
            if (!inv_price_id) return errorResponse(res, 
                messages.InventoryPrices?.price_needed ?? "Inventory price ID is required", 
                400
            );

            const response = await InventoryPricesService.setAsCurrent(inv_price_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryPricesController.setAsCurrent catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryPricesController.setAsCurrent catch error: ', e);
                return errorResponse(res, e?.message || 'Error setting price as current', 500);
            }
        }
    }
} 