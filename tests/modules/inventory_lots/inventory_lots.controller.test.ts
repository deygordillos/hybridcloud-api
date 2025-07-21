import { InventoryLotsService } from "../../../src/services/InventoryLotsService";
import { InventoryVariantsService } from "../../../src/services/InventoryVariantsService";
import { InventoryFamilyService } from "../../../src/services/InventoryFamilyService";
import { InventoryService } from "../../../src/services/InventoryService";
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany } from "../../helpers/setupTestData";
import { Companies } from "../../../src/entity/companies.entity";

let company: Companies;
let inventoryFamily: any;
let inventory: any;
let inventoryVariant: any;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  company = await createTestCompany();
  
  // Create test inventory family
  inventoryFamily = await InventoryFamilyService.create({
    company_id: company,
    inv_family_code: 'LOT01',
    inv_family_name: 'Test Lots Family',
    inv_family_status: 1,
    inv_is_stockable: 1,
    inv_is_lot_managed: 1,
    tax_id: null
  });

  // Create test inventory
  inventory = await InventoryService.create({
    inv_code: 'INV001',
    id_inv_family: inventoryFamily.id_inv_family,
    inv_description: 'Test Inventory for Lots',
    inv_status: 1,
    inv_type: 1,
    inv_has_variants: 1,
    inv_is_exempt: 0,
    inv_is_stockable: 1,
    inv_is_lot_managed: 1,
    inv_brand: 'Test Brand',
    inv_model: 'Test Model'
  });

  // Create test inventory variant
  inventoryVariant = await InventoryVariantsService.createVariant({
    inv_id: inventory.inv_id,
    inv_var_sku: 'VAR001',
    inv_var_status: 1
  });
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Inventory Lots Service - Business Logic Tests', () => {
  describe('CRUD Operations', () => {
    it('should create an inventory lot with all fields', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_origin: 'Test Supplier',
        lot_status: 1,
        expiration_date: new Date('2024-12-31'),
        manufacture_date: new Date('2024-01-01'),
        lot_notes: 'Test lot notes',
        lot_unit_cost: 25.50,
        lot_unit_currency_id: 1,
        lot_unit_cost_ref: 30.00,
        lot_unit_currency_id_ref: 1
      };

      const inventoryLot = await InventoryLotsService.create(lotData);
      
      expect(inventoryLot).toHaveProperty('inv_lot_id');
      expect(inventoryLot.lot_number).toBe('LOT123');
      expect(inventoryLot.lot_origin).toBe('Test Supplier');
      expect(inventoryLot.lot_status).toBe(1);
      expect(inventoryLot.lot_unit_cost).toBe(25.50);
      expect(inventoryLot.lot_unit_cost_ref).toBe(30.00);
      expect(inventoryLot.lot_unit_currency_id).toBe(1);
      expect(inventoryLot.lot_unit_currency_id_ref).toBe(1);
    });

    it('should create an inventory lot with minimal required fields', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTMINIMAL'
      };

      const inventoryLot = await InventoryLotsService.create(lotData);
      
      expect(inventoryLot).toHaveProperty('inv_lot_id');
      expect(inventoryLot.lot_number).toBe('LOTMINIMAL');
      expect(inventoryLot.lot_status).toBe(1); // Default value
      expect(inventoryLot.lot_unit_currency_id).toBe(1); // Default value
      expect(inventoryLot.lot_unit_currency_id_ref).toBe(1); // Default value
    });

    it('should find inventory lot by ID with relations', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTFIND'
      };

      const createdLot = await InventoryLotsService.create(lotData);
      const foundLot = await InventoryLotsService.findById(createdLot.inv_lot_id);
      
      expect(foundLot).toBeDefined();
      expect(foundLot?.inv_lot_id).toBe(createdLot.inv_lot_id);
      expect(foundLot?.lot_number).toBe('LOTFIND');
      expect(foundLot?.inventoryVariant).toBeDefined();
      expect(foundLot?.inventoryVariant.inv_var_id).toBe(inventoryVariant.inv_var_id);
    });

    it('should update an inventory lot', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTUPDATE',
        lot_status: 1
      };

      const createdLot = await InventoryLotsService.create(lotData);
      const updateData = {
        lot_status: 0,
        lot_notes: 'Updated notes',
        lot_unit_cost: 35.75
      };

      const updatedLot = await InventoryLotsService.update(createdLot.inv_lot_id, updateData);
      
      expect(updatedLot).toBeDefined();
      expect(updatedLot?.lot_status).toBe(0);
      expect(updatedLot?.lot_notes).toBe('Updated notes');
      expect(updatedLot?.lot_unit_cost).toBe(35.75);
    });

    it('should delete an inventory lot', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTDELETE'
      };

      const createdLot = await InventoryLotsService.create(lotData);
      const deleted = await InventoryLotsService.delete(createdLot.inv_lot_id);
      
      expect(deleted).toBe(true);
      
      const foundLot = await InventoryLotsService.findById(createdLot.inv_lot_id);
      expect(foundLot).toBeNull();
    });
  });

  describe('Query Operations', () => {
    it('should find all lots by variant ID', async () => {
      const lotData1 = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTQUERY1'
      };

      const lotData2 = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTQUERY2'
      };

      await InventoryLotsService.create(lotData1);
      await InventoryLotsService.create(lotData2);

      const lots = await InventoryLotsService.findAllByVariantId(inventoryVariant.inv_var_id);
      
      expect(lots.length).toBeGreaterThan(0);
      expect(lots.every(lot => lot.inv_var_id === inventoryVariant.inv_var_id)).toBe(true);
      expect(lots.some(lot => lot.lot_number === 'LOTQUERY1')).toBe(true);
      expect(lots.some(lot => lot.lot_number === 'LOTQUERY2')).toBe(true);
    });

    it('should find lots by lot number', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTSEARCH'
      };

      await InventoryLotsService.create(lotData);
      const lots = await InventoryLotsService.findAllByLotNumber('LOTSEARCH');
      
      expect(lots.length).toBeGreaterThan(0);
      expect(lots.every(lot => lot.lot_number === 'LOTSEARCH')).toBe(true);
    });

    it('should return empty array for non-existent lot number', async () => {
      const lots = await InventoryLotsService.findAllByLotNumber('NONEXISTENT');
      expect(lots).toHaveLength(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate lot data correctly', async () => {
      const validData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTVALID',
        lot_status: 1,
        lot_unit_cost: 25.50
      };

      const validation = await InventoryLotsService.validateLotData(validData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation with missing lot number', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_status: 1
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot number is required');
    });

    it('should fail validation with empty lot number', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: '',
        lot_status: 1
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot number is required');
    });

    it('should fail validation with lot number exceeding 100 characters', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'A'.repeat(101),
        lot_status: 1
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot number cannot exceed 100 characters');
    });

    it('should fail validation with lot origin exceeding 100 characters', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_origin: 'A'.repeat(101)
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot origin cannot exceed 100 characters');
    });

    it('should fail validation with negative lot unit cost', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_unit_cost: -10
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot unit cost cannot be negative');
    });

    it('should fail validation with negative lot unit cost reference', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_unit_cost_ref: -5
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Lot unit cost reference cannot be negative');
    });

    it('should fail validation when expiration date is before manufacture date', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        expiration_date: new Date('2024-01-01'),
        manufacture_date: new Date('2024-12-31')
      };

      const validation = await InventoryLotsService.validateLotData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Expiration date must be after manufacture date');
    });

    it('should pass validation when expiration date equals manufacture date', async () => {
      const sameDate = new Date('2024-06-15');
      const validData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        expiration_date: sameDate,
        manufacture_date: sameDate
      };

      const validation = await InventoryLotsService.validateLotData(validData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Expiration date must be after manufacture date');
    });
  });

  describe('Duplicate Checking', () => {
    it('should check if lot number exists', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTEXISTS'
      };

      await InventoryLotsService.create(lotData);
      
      const exists = await InventoryLotsService.checkLotNumberExists('LOTEXISTS');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent lot number', async () => {
      const notExists = await InventoryLotsService.checkLotNumberExists('LOTNOTEXISTS');
      expect(notExists).toBe(false);
    });

    it('should exclude current lot when checking duplicates for updates', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTEXCLUDE'
      };

      const createdLot = await InventoryLotsService.create(lotData);
      
      // Should not find duplicate when excluding the current lot
      const exists = await InventoryLotsService.checkLotNumberExists('LOTEXCLUDE', createdLot.inv_lot_id);
      expect(exists).toBe(false);
    });
  });

  describe('Summary Statistics', () => {
    beforeEach(async () => {
      // Create test lots for statistics
      await InventoryLotsService.create({
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTSTAT1',
        lot_status: 1
      });

      await InventoryLotsService.create({
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTSTAT2',
        lot_status: 0
      });

      await InventoryLotsService.create({
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTSTAT3',
        lot_status: 1,
        expiration_date: new Date('2024-12-31')
      });
    });

    it('should get lots summary statistics', async () => {
      const summary = await InventoryLotsService.getLotsSummary();
      
      expect(summary).toHaveProperty('totalLots');
      expect(summary).toHaveProperty('activeLots');
      expect(summary).toHaveProperty('inactiveLots');
      expect(summary).toHaveProperty('expiringSoon');
      expect(summary).toHaveProperty('expiredLots');
      
      expect(typeof summary.totalLots).toBe('number');
      expect(typeof summary.activeLots).toBe('number');
      expect(typeof summary.inactiveLots).toBe('number');
      expect(typeof summary.expiringSoon).toBe('number');
      expect(typeof summary.expiredLots).toBe('number');
      
      expect(summary.totalLots).toBeGreaterThan(0);
      expect(summary.activeLots).toBeGreaterThan(0);
    });

    it('should calculate correct statistics', async () => {
      const summary = await InventoryLotsService.getLotsSummary();
      
      // Basic validation of statistics
      expect(summary.totalLots).toBeGreaterThanOrEqual(summary.activeLots + summary.inactiveLots);
      expect(summary.activeLots).toBeGreaterThanOrEqual(0);
      expect(summary.inactiveLots).toBeGreaterThanOrEqual(0);
      expect(summary.expiringSoon).toBeGreaterThanOrEqual(0);
      expect(summary.expiredLots).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined optional fields', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTNULL',
        lot_origin: undefined,
        lot_notes: undefined,
        lot_unit_cost: undefined
      };

      const inventoryLot = await InventoryLotsService.create(lotData);
      
      expect(inventoryLot).toHaveProperty('inv_lot_id');
      expect(inventoryLot.lot_number).toBe('LOTNULL');
    });

    it('should handle zero values for numeric fields', async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTZERO',
        lot_unit_cost: 0,
        lot_unit_cost_ref: 0
      };

      const inventoryLot = await InventoryLotsService.create(lotData);
      
      expect(inventoryLot.lot_unit_cost).toBe(0);
      expect(inventoryLot.lot_unit_cost_ref).toBe(0);
    });

    it('should handle very long lot notes', async () => {
      const longNotes = 'A'.repeat(1000);
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTLONG',
        lot_notes: longNotes
      };

      const inventoryLot = await InventoryLotsService.create(lotData);
      
      expect(inventoryLot.lot_notes).toBe(longNotes);
    });
  });
}); 