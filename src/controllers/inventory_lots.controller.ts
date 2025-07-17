import { Request, Response } from "express";
import { InventoryLotsService } from "../services/InventoryLotsService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryLots } from "../entity/inventory_lots.entity";
import { errorResponse, successResponse } from "../helpers/responseHelper";

export class InventoryLotsController {

    /**
     * Get inventory lot by ID
     */
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) return errorResponse(res, "Invalid lot ID", 400);

            const lot = await InventoryLotsService.findById(lotId);
            if (!lot) return errorResponse(res, "Inventory lot not found", 404);

            return successResponse(res, "Inventory lot retrieved successfully", 200, lot);
        } catch (error) {
            console.error("Error getting inventory lot:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Create new inventory lot
     */
    static async create(req: Request, res: Response) {
        try {
            const lotData: Partial<InventoryLots> = req.body;

            // Validate lot data
            const validation = await InventoryLotsService.validateLotData(lotData);
            if (!validation.isValid) return errorResponse(res, "Validation failed", 400, validation.errors);

            // Validate that the inventory variant exists
            const variant = await InventoryVariantsService.findById(lotData.inv_var_id!);
            if (!variant) return errorResponse(res, "Inventory variant not found", 404);

            // Validate that the inventory variant exists
            const filteredLots = await InventoryLotsService.findAllByVariantId(lotData.inv_var_id!);
            if (filteredLots.length > 0) return errorResponse(res, "Variant has already a lot", 400);

            // Check if lot number already exists
            const lotExists = await InventoryLotsService.checkLotNumberExists(lotData.lot_number!);
            if (lotExists) return errorResponse(res, "Lot number already exists", 400);

            const newLot = await InventoryLotsService.create(lotData);
            return successResponse(res, "Inventory lot created successfully", 201, newLot);
        } catch (error) {
            console.error("Error creating inventory lot:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Update inventory lot
     */
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);
            const updateData: Partial<InventoryLots> = req.body;

            if (isNaN(lotId)) return errorResponse(res, "Invalid lot ID", 400);

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) return errorResponse(res, "Inventory lot not found", 404);

            // Validate update data
            const validation = await InventoryLotsService.validateLotData(updateData, true);
            if (!validation.isValid) return errorResponse(res, "Validation failed", 400, validation.errors);

            // Validate that the inventory variant exists (if being updated)
            if (updateData.inv_var_id && updateData.inv_var_id !== existingLot.inv_var_id) {
                const variant = await InventoryVariantsService.findById(updateData.inv_var_id);
                if (!variant) return errorResponse(res, "Inventory variant not found", 400);
            }

            // Check if lot number already exists (excluding current lot)
            if (updateData.lot_number && updateData.lot_number !== existingLot.lot_number) {
                const lotExists = await InventoryLotsService.checkLotNumberExists(updateData.lot_number, lotId);
                if (lotExists) return errorResponse(res, "Lot number already exists", 400);
            }

            const updatedLot = await InventoryLotsService.update(lotId, updateData);
            return successResponse(res, "Inventory lot updated successfully", 200, updatedLot);
        } catch (error) {
            console.error("Error updating inventory lot:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Get inventory lots by variant ID
     */
    static async getByVariantId(req: Request, res: Response) {
        try {
            const { variantId } = req.params;
            const invVarId = parseInt(variantId);

            if (isNaN(invVarId)) return errorResponse(res, "Invalid variant ID", 400);

            const filteredLots = await InventoryLotsService.findAllByVariantId(invVarId);

            return successResponse(res, "Inventory lots retrieved successfully", 200, filteredLots);
        } catch (error) {
            console.error("Error getting inventory lots by variant ID:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Get inventory lots by lot number
     */
    static async getByLotNumber(req: Request, res: Response) {
        try {
            const { lotNumber } = req.params;

            if (!lotNumber || lotNumber.trim() === '') return errorResponse(res, "Lot number is required", 400);

            const filteredLots = await InventoryLotsService.findAllByLotNumber(lotNumber);

            return successResponse(res, "Inventory lots retrieved successfully", 200, filteredLots);
        } catch (error) {
            console.error("Error getting inventory lots by lot number:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Get lots summary statistics
     */
    static async getSummary(req: Request, res: Response) {
        try {
            const summary = await InventoryLotsService.getLotsSummary();
            return successResponse(res, "Lots summary retrieved successfully", 200, summary);
        } catch (error) {
            console.error("Error getting lots summary:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Deactivate inventory lot
     */
    static async deactivate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) return errorResponse(res, "Invalid lot ID", 400);

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) return errorResponse(res, "Inventory lot not found", 404);

            await InventoryLotsService.update(lotId, { lot_status: 0 });
            return successResponse(res, "Inventory lot deactivated successfully", 200);
        } catch (error) {
            console.error("Error deactivating inventory lot:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }

    /**
     * Activate inventory lot
     */
    static async activate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) return errorResponse(res, "Invalid lot ID", 400);

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) return errorResponse(res, "Inventory lot not found", 404);

            await InventoryLotsService.update(lotId, { lot_status: 1 });
            return successResponse(res, "Inventory lot activated successfully", 200);
        } catch (error) {
            console.error("Error activating inventory lot:", error);
            return errorResponse(res, "Internal server error", 500);
        }
    }
} 