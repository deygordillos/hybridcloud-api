import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryLotsStoragesService } from "../services/InventoryLotsStoragesService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryLotsService } from "../services/InventoryLotsService";
import { InventoryStorageService } from "../services/InventoryStorageService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class InventoryLotsStoragesController {
    /**
     * Get lot storages by variant ID
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
            const { data, total } = await InventoryLotsStoragesService.getStoragesByVariantId(inv_var_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Lot storages found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving lot storages', 503, e);
        }
    }

    /**
     * Get lot storages by lot ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStoragesByLotId(req: Request, res: Response) {
        try {
            const inv_lot_id = parseInt(req.params.lotId, 10);
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryLotsStoragesService.getStoragesByLotId(inv_lot_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Lot storages found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving lot storages', 503, e);
        }
    }

    /**
     * Get lot storage by lot ID and storage ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStorageByLotAndStorage(req: Request, res: Response) {
        try {
            const inv_lot_id = parseInt(req.params.lotId, 10);
            const id_inv_storage = parseInt(req.params.storageId, 10);
            
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const data = await InventoryLotsStoragesService.getStorageByLotAndStorage(inv_lot_id, id_inv_storage);

            return successResponse(res, 'Lot storage found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving lot storage', 503, e);
        }
    }

    /**
     * Get stock summary by lot ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStockSummaryByLotId(req: Request, res: Response) {
        try {
            const inv_lot_id = parseInt(req.params.lotId, 10);
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);

            const data = await InventoryLotsStoragesService.getStockSummaryByLotId(inv_lot_id);

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
            const { data, total } = await InventoryLotsStoragesService.getStoragesByLocationId(id_inv_storage, offset, limit);

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
     * Get lot storages by variant and lot
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getStoragesByVariantAndLot(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            const inv_lot_id = parseInt(req.params.lotId, 10);
            
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryLotsStoragesService.getStoragesByVariantAndLot(inv_var_id, inv_lot_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Variant lot storages found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving variant lot storages', 503, e);
        }
    }

    /**
     * Create a lot storage
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const data = req.body;

            // Validate required fields
            if (!data.inv_var_id || !data.inv_lot_id || !data.id_inv_storage) {
                return errorResponse(res, "Variant ID, Lot ID and Storage ID are required", 400);
            }

            // Check if variant exists
            const variant = await InventoryVariantsService.findById(data.inv_var_id);
            if (!variant) {
                return errorResponse(res, "Inventory variant does not exist", 404);
            }

            // Check if lot exists
            const lot = await InventoryLotsService.findById(data.inv_lot_id);
            if (!lot) {
                return errorResponse(res, "Inventory lot does not exist", 404);
            }

            // Check if storage exists
            const storage = await InventoryStorageService.findInventoryStorageById(data.id_inv_storage);
            if (!storage) {
                return errorResponse(res, "Inventory storage does not exist", 404);
            }

            const result = await InventoryLotsStoragesService.create(data, user_id);

            return successResponse(res, 
                messages.InventoryLotsStorages?.storage_created ?? "Lot storage created", 
                201, 
                result
            );
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryLotsStoragesController.create catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryLotsStoragesController.create catch error: ', e);
                return errorResponse(res, e?.message || 'Error creating lot storage', 500);
            }
        }
    }

    /**
     * Update a lot storage
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const inv_lot_storage_id = parseInt(req.params.id, 10);
            if (!inv_lot_storage_id) return errorResponse(res, 
                messages.InventoryLotsStorages?.storage_needed ?? "Lot storage ID is required", 
                400
            );

            const storage = await InventoryLotsStoragesService.findStorageById(inv_lot_storage_id);
            if (!storage) return errorResponse(res, 
                messages.InventoryLotsStorages?.storage_not_exists ?? "Lot storage does not exist", 
                404
            );

            const response = await InventoryLotsStoragesService.update(storage, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryLotsStoragesController.update catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryLotsStoragesController.update catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating lot storage', 500);
            }
        }
    }

    /**
     * Delete a lot storage
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async delete(req: Request, res: Response) {
        try {
            const inv_lot_storage_id = parseInt(req.params.id, 10);
            if (!inv_lot_storage_id) return errorResponse(res, 
                messages.InventoryLotsStorages?.storage_needed ?? "Lot storage ID is required", 
                400
            );

            const response = await InventoryLotsStoragesService.delete(inv_lot_storage_id);

            return successResponse(res, response.message, 200);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryLotsStoragesController.delete catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryLotsStoragesController.delete catch error: ', e);
                return errorResponse(res, e?.message || 'Error deleting lot storage', 500);
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
            const inv_lot_id = parseInt(req.params.lotId, 10);
            const id_inv_storage = parseInt(req.params.storageId, 10);
            
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const response = await InventoryLotsStoragesService.updateStock(inv_lot_id, id_inv_storage, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryLotsStoragesController.updateStock catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryLotsStoragesController.updateStock catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating stock', 500);
            }
        }
    }
} 