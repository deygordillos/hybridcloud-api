import { InventoryLots } from "../entity/inventory_lots.entity";
import { InventoryLotsRepository } from "../repositories/InventoryLotsRepository";

export class InventoryLotsService {
    
    static async create(lotData: Partial<InventoryLots>): Promise<InventoryLots> {
        const lot = InventoryLotsRepository.create(lotData);
        return await InventoryLotsRepository.save(lot);
    }

    static async findById(id: number): Promise<InventoryLots | null> {
        return await InventoryLotsRepository.findOne({
            where: { inv_lot_id: id },
            relations: ['inventoryVariant']
        });
    }

    static async findAllByVariantId(invVarId: number): Promise<InventoryLots[]> {
        return await InventoryLotsRepository.find({
            where: { inv_var_id: invVarId },
            relations: ['inventoryVariant']
        });
    }

    static async findAllByLotNumber(lotNumber: string): Promise<InventoryLots[]> {
        return await InventoryLotsRepository.find({
            where: { lot_number: lotNumber },
            relations: ['inventoryVariant']
        });
    }

    static async update(id: number, lotData: Partial<InventoryLots>): Promise<InventoryLots | null> {
        await InventoryLotsRepository.update(id, lotData);
        return await this.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const result = await InventoryLotsRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    static async validateLotData(lotData: Partial<InventoryLots>): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        if (!lotData.lot_number || lotData.lot_number.trim() === '') {
            errors.push('Lot number is required');
        }

        if (lotData.lot_number && lotData.lot_number.length > 100) {
            errors.push('Lot number cannot exceed 100 characters');
        }

        if (lotData.lot_origin && lotData.lot_origin.length > 100) {
            errors.push('Lot origin cannot exceed 100 characters');
        }

        if (lotData.lot_unit_cost !== undefined && lotData.lot_unit_cost < 0) {
            errors.push('Lot unit cost cannot be negative');
        }

        if (lotData.lot_unit_cost_ref !== undefined && lotData.lot_unit_cost_ref < 0) {
            errors.push('Lot unit cost reference cannot be negative');
        }

        if (lotData.expiration_date && lotData.manufacture_date) {
            if (new Date(lotData.expiration_date) <= new Date(lotData.manufacture_date)) {
                errors.push('Expiration date must be after manufacture date');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static async checkLotNumberExists(lotNumber: string, excludeId?: number): Promise<boolean> {
        const query = InventoryLotsRepository.createQueryBuilder('lot')
            .where('lot.lot_number = :lotNumber', { lotNumber });

        if (excludeId) {
            query.andWhere('lot.inv_lot_id != :excludeId', { excludeId });
        }

        const existingLot = await query.getOne();
        return !!existingLot;
    }

    static async getLotsSummary(): Promise<{
        totalLots: number;
        activeLots: number;
        inactiveLots: number;
        expiringSoon: number;
        expiredLots: number;
    }> {
        const totalLots = await InventoryLotsRepository.count();
        const activeLots = await InventoryLotsRepository.count({ where: { lot_status: 1 } });
        const inactiveLots = await InventoryLotsRepository.count({ where: { lot_status: 0 } });
        
        const today = new Date();
        const expiringSoon = await InventoryLotsRepository.count({
            where: {
                lot_status: 1,
                expiration_date: today
            }
        });

        const expiredLots = await InventoryLotsRepository.count({
            where: {
                lot_status: 1,
                expiration_date: today
            }
        });

        return {
            totalLots,
            activeLots,
            inactiveLots,
            expiringSoon,
            expiredLots
        };
    }
} 