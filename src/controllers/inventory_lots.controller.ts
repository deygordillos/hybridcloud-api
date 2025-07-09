import { Request, Response } from "express";
import { InventoryLotsService } from "../services/InventoryLotsService";
import { InventoryVariantsService } from "../services/InventoryVariantsService";
import { InventoryLots } from "../entity/inventory_lots.entity";

export class InventoryLotsController {

    /**
     * Get inventory lot by ID
     */
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lot ID"
                });
            }

            const lot = await InventoryLotsService.findById(lotId);
            if (!lot) {
                return res.status(404).json({
                    success: false,
                    message: "Inventory lot not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: lot,
                message: "Inventory lot retrieved successfully"
            });
        } catch (error) {
            console.error("Error getting inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
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
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors
                });
            }

            // Validate that the inventory variant exists
            const variant = await InventoryVariantsService.findById(lotData.inv_var_id!);
            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: "Inventory variant not found"
                });
            }

            // Check if lot number already exists
            const lotExists = await InventoryLotsService.checkLotNumberExists(lotData.lot_number!);
            if (lotExists) {
                return res.status(400).json({
                    success: false,
                    message: "Lot number already exists"
                });
            }

            const newLot = await InventoryLotsService.create(lotData);
            return res.status(201).json({
                success: true,
                data: newLot,
                message: "Inventory lot created successfully"
            });
        } catch (error) {
            console.error("Error creating inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
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

            if (isNaN(lotId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lot ID"
                });
            }

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) {
                return res.status(404).json({
                    success: false,
                    message: "Inventory lot not found"
                });
            }

            // Validate update data
            const validation = await InventoryLotsService.validateLotData(updateData);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors
                });
            }

            // Validate that the inventory variant exists (if being updated)
            if (updateData.inv_var_id && updateData.inv_var_id !== existingLot.inv_var_id) {
                const variant = await InventoryVariantsService.findById(updateData.inv_var_id);
                if (!variant) {
                    return res.status(400).json({
                        success: false,
                        message: "Inventory variant not found"
                    });
                }
            }

            // Check if lot number already exists (excluding current lot)
            if (updateData.lot_number && updateData.lot_number !== existingLot.lot_number) {
                const lotExists = await InventoryLotsService.checkLotNumberExists(updateData.lot_number, lotId);
                if (lotExists) {
                    return res.status(400).json({
                        success: false,
                        message: "Lot number already exists"
                    });
                }
            }

            const updatedLot = await InventoryLotsService.update(lotId, updateData);
            return res.status(200).json({
                success: true,
                data: updatedLot,
                message: "Inventory lot updated successfully"
            });
        } catch (error) {
            console.error("Error updating inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Delete inventory lot
     */
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lot ID"
                });
            }

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) {
                return res.status(404).json({
                    success: false,
                    message: "Inventory lot not found"
                });
            }

            const deleted = await InventoryLotsService.delete(lotId);
            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete inventory lot"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Inventory lot deleted successfully"
            });
        } catch (error) {
            console.error("Error deleting inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Get inventory lots by variant ID
     */
    static async getByVariantId(req: Request, res: Response) {
        try {
            const { variantId } = req.params;
            const invVarId = parseInt(variantId);

            if (isNaN(invVarId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid variant ID"
                });
            }

            const filteredLots = await InventoryLotsService.findAllByVariantId(invVarId);

            return res.status(200).json({
                success: true,
                data: filteredLots,
                message: "Inventory lots retrieved successfully"
            });
        } catch (error) {
            console.error("Error getting inventory lots by variant ID:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Get inventory lots by lot number
     */
    static async getByLotNumber(req: Request, res: Response) {
        try {
            const { lotNumber } = req.params;

            if (!lotNumber || lotNumber.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Lot number is required"
                });
            }

            const filteredLots = await InventoryLotsService.findAllByLotNumber(lotNumber);

            return res.status(200).json({
                success: true,
                data: filteredLots,
                message: "Inventory lots retrieved successfully"
            });
        } catch (error) {
            console.error("Error getting inventory lots by lot number:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Get lots summary statistics
     */
    static async getSummary(req: Request, res: Response) {
        try {
            const summary = await InventoryLotsService.getLotsSummary();
            return res.status(200).json({
                success: true,
                data: summary,
                message: "Lots summary retrieved successfully"
            });
        } catch (error) {
            console.error("Error getting lots summary:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Deactivate inventory lot
     */
    static async deactivate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lot ID"
                });
            }

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) {
                return res.status(404).json({
                    success: false,
                    message: "Inventory lot not found"
                });
            }

            await InventoryLotsService.update(lotId, { lot_status: 0 });
            return res.status(200).json({
                success: true,
                message: "Inventory lot deactivated successfully"
            });
        } catch (error) {
            console.error("Error deactivating inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    /**
     * Activate inventory lot
     */
    static async activate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lotId = parseInt(id);

            if (isNaN(lotId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lot ID"
                });
            }

            // Check if lot exists
            const existingLot = await InventoryLotsService.findById(lotId);
            if (!existingLot) {
                return res.status(404).json({
                    success: false,
                    message: "Inventory lot not found"
                });
            }

            await InventoryLotsService.update(lotId, { lot_status: 1 });
            return res.status(200).json({
                success: true,
                message: "Inventory lot activated successfully"
            });
        } catch (error) {
            console.error("Error activating inventory lot:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
} 