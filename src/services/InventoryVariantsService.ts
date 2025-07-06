import { appDataSource } from "../app-data-source";
import { InventoryVariants } from "../entity/inventory_variants.entity";
import { InventoryVariantsAttrs } from "../entity/inventory_variants_attrs.entity";
import { InventoryAttrsValuesRepository } from "../repositories/InventoryAttrsValuesRepository";
import { InventoryVariantsRepository } from "../repositories/InventoryVariantsRepository";
import { InventoryVariantsAttrsRepository } from "../repositories/InventoryVariantsAttrsRepository";

export class InventoryVariantsService {

    static async findBySku(inv_id: number, inv_var_sku: string) {
        return await InventoryVariantsRepository.findOne({
            where: {
                inv_id,
                inv_var_sku
            }
        });
    }

    /**
     * Create a new inventory variant
     */
    static async createVariant(data: Partial<InventoryVariants>) {
        const variant = InventoryVariantsRepository.create(data);
        return await InventoryVariantsRepository.save(variant);
    }

    /**
     * Update an existing inventory variant
     */
    static async updateVariant(inv_var_id: number, data: Partial<InventoryVariants>) {
        await InventoryVariantsRepository.update(inv_var_id, data);
        return await InventoryVariantsRepository.findOne({ where: { inv_var_id } });
    }

    /**
     * Update an existing inventory variant
     */
    static async upsertAttributesToVariant(inv_var_id: number, attr_values: number[]) {
        // Obtener los atributos actuales asociados a la variante
        const currentAttrs = await InventoryVariantsAttrsRepository.find({
            where: { inv_var_id }
        });

        // Extraer los IDs actuales
        const currentAttrIds = currentAttrs.map(a => a.inv_attrval_id);

        // Para cada attr_value recibido
        for (const inv_attrval_id of attr_values) {
            if (currentAttrIds.includes(inv_attrval_id)) {
                // Ya existe la asociación, puedes actualizar aquí si hay más campos a modificar
                // Si solo es la relación, no necesitas hacer nada
                continue;
            } else {
                // No existe, así que la creas
                await InventoryVariantsAttrsRepository.save({
                    inv_var_id,
                    inv_attrval_id
                });
            }
        }
    }

    /**
     * Create multiple variants in bulk
     */
    static async bulkCreateVariants(variants: Partial<InventoryVariants>[]) {
        const records = InventoryVariantsRepository.create(variants);
        return await InventoryVariantsRepository.save(records);
    }

    /**
     * Find an attribute value by its ID
     */
    static async findAttrValueById(inv_attrval_id: number) {
        return await InventoryAttrsValuesRepository.findOne({ where: { inv_attrval_id } });
    }

    /**
     * Associate attributes to a variant
     */
    static async addAttributesToVariant(inv_var_id: number, attrs: number[]) {
        // Validar que todos los inv_attrval_id existen
        for (const inv_attrval_id of attrs) {
            const exists = await InventoryAttrsValuesRepository.findOne({ where: { inv_attrval_id } });
            if (!exists) throw new Error(`Attribute value with id ${inv_attrval_id} does not exist`);
        }
        
        const records = attrs.map(inv_attrval_id => ({
            inv_var_id,
            inv_attrval_id
        }));
        const entities = InventoryVariantsAttrsRepository.create(records);
        return await InventoryVariantsAttrsRepository.save(entities);
    }

    /**
     * Create a variant with attributes in a transaction
     */
    static async createVariantWithAttributes(variantData: Partial<InventoryVariants>, attrs: { inv_attrval_id: number }[]) {
        return await appDataSource.transaction(async manager => {
            const variant = manager.create(InventoryVariants, variantData);
            await manager.save(variant);

            if (attrs && attrs.length > 0) {
                const attrEntities = attrs.map(attr => ({
                    inv_var_id: variant.inv_var_id,
                    inv_attrval_id: attr.inv_attrval_id
                }));
                const variantAttrs = manager.create(InventoryVariantsAttrs, attrEntities);
                await manager.save(variantAttrs);
            }

            return variant;
        });
    }
}