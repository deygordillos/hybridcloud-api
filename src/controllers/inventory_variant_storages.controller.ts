import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryVariantStoragesService } from "../services/InventoryVariantStoragesService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryStorageService } from "../services/InventoryStorageService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class InventoryVariantStoragesController {
    /**
     * Get variant storages by variant ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStoragesByVariantId(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryVariantStoragesService.getStoragesByVariantId(inv_var_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Variant storages found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving variant storages', 503, e);
        }
    }

    /**
     * Get variant storage by variant ID and storage ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStorageByVariantAndStorage(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            const id_inv_storage = parseInt(req.params.storageId, 10);
            
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const data = await InventoryVariantStoragesService.getStorageByVariantAndStorage(inv_var_id, id_inv_storage);

            return successResponse(res, 'Variant storage found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving variant storage', 503, e);
        }
    }

    /**
     * Get stock summary by variant ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStockSummaryByVariantId(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);

            const data = await InventoryVariantStoragesService.getStockSummaryByVariantId(inv_var_id);

            return successResponse(res, 'Stock summary found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving stock summary', 503, e);
        }
    }

    /**
     * Get storages by location ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStoragesByLocationId(req: Request, res: Response) {
        try {
            const id_inv_storage = parseInt(req.params.storageId, 10);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryVariantStoragesService.getStoragesByLocationId(id_inv_storage, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Location storages found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving location storages', 503, e);
        }
    }

    /**
     * Create a variant storage
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const data = req.body;

            // Validate required fields
            if (!data.inv_var_id || !data.id_inv_storage) {
                return errorResponse(res, "Variant ID and Storage ID are required", 400);
            }

            // Check if variant exists
            const variant = await InventoryVariantsService.findById(data.inv_var_id);
            if (!variant) {
                return errorResponse(res, "Inventory variant does not exist", 404);
            }

            // Check if storage exists
            const storage = await InventoryStorageService.findInventoryStorageById(data.id_inv_storage);
            if (!storage) {
                return errorResponse(res, "Inventory storage does not exist", 404);
            }

            const result = await InventoryVariantStoragesService.create(data, user_id);

            return successResponse(res, 
                messages.InventoryVariantStorages?.storage_created ?? "Variant storage created", 
                201, 
                result
            );
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryVariantStoragesController.create catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryVariantStoragesController.create catch error: ', e);
                return errorResponse(res, e?.message || 'Error creating variant storage', 500);
            }
        }
    }

    /**
     * Update a variant storage
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const inv_var_storage_id = parseInt(req.params.id, 10);
            if (!inv_var_storage_id) return errorResponse(res, 
                messages.InventoryVariantStorages?.storage_needed ?? "Variant storage ID is required", 
                400
            );

            const storage = await InventoryVariantStoragesService.findStorageById(inv_var_storage_id);
            if (!storage) return errorResponse(res, 
                messages.InventoryVariantStorages?.storage_not_exists ?? "Variant storage does not exist", 
                404
            );

            const response = await InventoryVariantStoragesService.update(storage, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryVariantStoragesController.update catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryVariantStoragesController.update catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating variant storage', 500);
            }
        }
    }

    /**
     * Delete a variant storage
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async delete(req: Request, res: Response) {
        try {
            const inv_var_storage_id = parseInt(req.params.id, 10);
            if (!inv_var_storage_id) return errorResponse(res, 
                messages.InventoryVariantStorages?.storage_needed ?? "Variant storage ID is required", 
                400
            );

            const response = await InventoryVariantStoragesService.delete(inv_var_storage_id);

            return successResponse(res, response.message, 200);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryVariantStoragesController.delete catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryVariantStoragesController.delete catch error: ', e);
                return errorResponse(res, e?.message || 'Error deleting variant storage', 500);
            }
        }
    }

    /**
     * Update stock levels
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async updateStock(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const inv_var_id = parseInt(req.params.variantId, 10);
            const id_inv_storage = parseInt(req.params.storageId, 10);
            
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const response = await InventoryVariantStoragesService.updateStock(inv_var_id, id_inv_storage, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryVariantStoragesController.updateStock catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryVariantStoragesController.updateStock catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating stock', 500);
            }
        }
    }
} 