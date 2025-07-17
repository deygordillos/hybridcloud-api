import { Request, Response } from "express";
import messages from "../config/messages";
import { InventoryMovementsService } from "../services/InventoryMovementsService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryLotsService } from "../services/InventoryLotsService";
import { InventoryStorageService } from "../services/InventoryStorageService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class InventoryMovementsController {
    /**
     * Get movements by variant ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByVariantId(req: Request, res: Response) {
        try {
            const inv_var_id = parseInt(req.params.variantId, 10);
            if (!inv_var_id) return errorResponse(res, "Variant ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByVariantId(inv_var_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Variant movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving variant movements', 503, e);
        }
    }

    /**
     * Get movements by lot ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByLotId(req: Request, res: Response) {
        try {
            const inv_lot_id = parseInt(req.params.lotId, 10);
            if (!inv_lot_id) return errorResponse(res, "Lot ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByLotId(inv_lot_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Lot movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving lot movements', 503, e);
        }
    }

    /**
     * Get movements by storage ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByStorageId(req: Request, res: Response) {
        try {
            const id_inv_storage = parseInt(req.params.storageId, 10);
            if (!id_inv_storage) return errorResponse(res, "Storage ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByStorageId(id_inv_storage, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Storage movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving storage movements', 503, e);
        }
    }

    /**
     * Get movements by type
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByType(req: Request, res: Response) {
        try {
            const movement_type = parseInt(req.params.type, 10);
            if (!movement_type || ![1, 2, 3].includes(movement_type)) {
                return errorResponse(res, "Valid movement type is required (1: In, 2: Out, 3: Transfer)", 400);
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByType(movement_type, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Type movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving type movements', 503, e);
        }
    }

    /**
     * Get movements by user ID
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByUserId(req: Request, res: Response) {
        try {
            const user_id = parseInt(req.params.userId, 10);
            if (!user_id) return errorResponse(res, "User ID is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByUserId(user_id, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'User movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving user movements', 503, e);
        }
    }

    /**
     * Get movement statistics
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementStatistics(req: Request, res: Response) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
            const movement_type = req.query.movement_type ? parseInt(req.query.movement_type as string, 10) : undefined;

            if (startDate && isNaN(startDate.getTime())) {
                return errorResponse(res, "Invalid start date format", 400);
            }

            if (endDate && isNaN(endDate.getTime())) {
                return errorResponse(res, "Invalid end date format", 400);
            }

            if (movement_type && ![1, 2, 3].includes(movement_type)) {
                return errorResponse(res, "Invalid movement type", 400);
            }

            const data = await InventoryMovementsService.getMovementStatistics(startDate, endDate, movement_type);

            return successResponse(res, 'Movement statistics found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving movement statistics', 503, e);
        }
    }

    /**
     * Get movements by date range
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByDateRange(req: Request, res: Response) {
        try {
            const startDate = new Date(req.params.startDate);
            const endDate = new Date(req.params.endDate);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return errorResponse(res, "Invalid date format", 400);
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByDateRange(startDate, endDate, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Date range movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving date range movements', 503, e);
        }
    }

    /**
     * Get movements by related document
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getMovementsByRelatedDoc(req: Request, res: Response) {
        try {
            const related_doc = req.params.relatedDoc;
            if (!related_doc) return errorResponse(res, "Related document is required", 400);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return errorResponse(res, "Invalid pagination parameters", 400);

            const offset = (page - 1) * limit;
            const { data, total } = await InventoryMovementsService.getMovementsByRelatedDoc(related_doc, offset, limit);

            const totalPages = Math.ceil(total / limit);
            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: totalPages
            };

            return successResponse(res, 'Related document movements found', 200, data, pagination);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving related document movements', 503, e);
        }
    }

    /**
     * Get latest movements
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async getLatestMovements(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 10;
            if (limit < 1 || limit > 100) return errorResponse(res, "Limit must be between 1 and 100", 400);

            const data = await InventoryMovementsService.getLatestMovements(limit);

            return successResponse(res, 'Latest movements found', 200, data);
        } catch (e) {
            console.error(e);
            return errorResponse(res, 'Error retrieving latest movements', 503, e);
        }
    }

    /**
     * Create a movement
     * @param req Request object 
     * @param res Response object
     * @returns 
     */
    static async create(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const data = req.body;

            // Validate required fields
            if (!data.id_inv_storage || !data.inv_var_id || !data.movement_type || !data.quantity) {
                return errorResponse(res, "Storage ID, Variant ID, Movement Type, and Quantity are required", 400);
            }

            // Validate movement type
            if (![1, 2, 3].includes(data.movement_type)) {
                return errorResponse(res, "Movement type must be 1 (In), 2 (Out), or 3 (Transfer)", 400);
            }

            // Check if storage exists
            const storage = await InventoryStorageService.findInventoryStorageById(data.id_inv_storage);
            if (!storage) {
                return errorResponse(res, "Inventory storage does not exist", 404);
            }

            // Check if variant exists
            const variant = await InventoryVariantsService.findById(data.inv_var_id);
            if (!variant) {
                return errorResponse(res, "Inventory variant does not exist", 404);
            }

            // Check if lot exists (if provided)
            if (data.inv_lot_id) {
                const lot = await InventoryLotsService.findById(data.inv_lot_id);
                if (!lot) {
                    return errorResponse(res, "Inventory lot does not exist", 404);
                }
            }

            const result = await InventoryMovementsService.create(data, user_id);

            return successResponse(res, 
                messages.InventoryMovements?.movement_created ?? "Inventory movement created", 
                201, 
                result
            );
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryMovementsController.create catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryMovementsController.create catch error: ', e);
                return errorResponse(res, e?.message || 'Error creating inventory movement', 500);
            }
        }
    }

    /**
     * Update a movement
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async update(req: Request, res: Response) {
        try {
            const { user_id } = req['user'] || { user_id: 0 };
            const inv_storage_move_id = parseInt(req.params.id, 10);
            if (!inv_storage_move_id) return errorResponse(res, 
                messages.InventoryMovements?.movement_needed ?? "Inventory movement ID is required", 
                400
            );

            const movement = await InventoryMovementsService.findMovementById(inv_storage_move_id);
            if (!movement) return errorResponse(res, 
                messages.InventoryMovements?.movement_not_exists ?? "Inventory movement does not exist", 
                404
            );

            const response = await InventoryMovementsService.update(movement, req.body, user_id);

            return successResponse(res, response.message, 200, response.data);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryMovementsController.update catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryMovementsController.update catch error: ', e);
                return errorResponse(res, e?.message || 'Error updating inventory movement', 500);
            }
        }
    }

    /**
     * Delete a movement
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    static async delete(req: Request, res: Response) {
        try {
            const inv_storage_move_id = parseInt(req.params.id, 10);
            if (!inv_storage_move_id) return errorResponse(res, 
                messages.InventoryMovements?.movement_needed ?? "Inventory movement ID is required", 
                400
            );

            const response = await InventoryMovementsService.delete(inv_storage_move_id);

            return successResponse(res, response.message, 200);
        } catch (e) {
            if (e instanceof Error) {
                console.error('InventoryMovementsController.delete catch error: ', e.message, e.stack);
                return errorResponse(res, e.message, 400);
            } else {
                console.error('InventoryMovementsController.delete catch error: ', e);
                return errorResponse(res, e?.message || 'Error deleting inventory movement', 500);
            }
        }
    }
} 