import request from 'supertest';
import app from '../../src/app';
import { appDataSource } from '../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../helpers/setupTestData';
import { InventoryVariantsService } from '../../src/services/InventoryVariantsService';
import { InventoryFamilyService } from '../../src/services/InventoryFamilyService';
import { InventoryService } from '../../src/services/InventoryService';
import { Companies } from '../../src/entity/companies.entity';

let company: Companies;
let token: string;
let inventoryFamily: any;
let inventory: any;
let inventoryVariant: any;
let inventoryVariant2: any;
let inventoryVariant3: any;
let inventoryVariant4: any;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  company = await createTestCompany();
  const { access_token } = await createTestUserAndToken(company);
  token = access_token;

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

  // Create multiple test inventory variants
  inventoryVariant = await InventoryVariantsService.createVariant({
    inv_id: inventory.inv_id,
    inv_var_sku: 'VAR001',
    inv_var_status: 1
  });

  inventoryVariant2 = await InventoryVariantsService.createVariant({
    inv_id: inventory.inv_id,
    inv_var_sku: 'VAR002',
    inv_var_status: 1
  });

  inventoryVariant3 = await InventoryVariantsService.createVariant({
    inv_id: inventory.inv_id,
    inv_var_sku: 'VAR003',
    inv_var_status: 1
  });

  inventoryVariant4 = await InventoryVariantsService.createVariant({
    inv_id: inventory.inv_id,
    inv_var_sku: 'VAR004',
    inv_var_status: 1
  });
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Inventory Lots Routes - Express Validator Tests', () => {
  describe('POST /api/v1/inventory/lots - Create Lot', () => {
    it('should create an inventory lot with valid data', async () => {
      const validLotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_origin: 'Test Supplier',
        lot_status: 1,
        expiration_date: '2024-12-31',
        manufacture_date: '2024-01-01',
        lot_notes: 'Test lot notes',
        lot_unit_cost: 25.50,
        lot_unit_currency_id: 1,
        lot_unit_cost_ref: 30.00,
        lot_unit_currency_id_ref: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(validLotData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('inv_lot_id');
      expect(res.body.data.lot_number).toBe('LOT123');
    });

    it('should fail validation when inv_var_id is missing', async () => {
      const invalidData = {
        lot_number: 'LOT123',
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'inv_var_id' && error.msg === 'inv_var_id is required'
      )).toBe(true);
    });

    it('should fail validation when inv_var_id is not a number', async () => {
      const invalidData = {
        inv_var_id: 'not-a-number',
        lot_number: 'LOT123',
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'inv_var_id' && error.msg === 'inv_var_id must be a number, not a string'
      )).toBe(true);
    });

    it('should fail validation when inv_var_id is less than 1', async () => {
      const invalidData = {
        inv_var_id: 0,
        lot_number: 'LOT123',
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'inv_var_id' && error.msg === 'You must send a valid inv_var_id'
      )).toBe(true);
    });

    it('should fail validation when lot_number is missing', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_number' && error.msg === 'lot_number is required'
      )).toBe(true);
    });

    it('should fail validation when lot_number is not a string', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 123,
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_number' && error.msg === 'lot_number is required'
      )).toBe(true);
    });

    it('should fail validation when lot_number exceeds 100 characters', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'A'.repeat(101), // 101 characters
        lot_status: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_number' && error.msg === 'lot_number must be a string (max 100 chars)'
      )).toBe(true);
    });

    it('should fail validation when lot_status is not 0 or 1', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_status: 2
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_status' && error.msg === 'lot_status must be 0 or 1'
      )).toBe(true);
    });

    it('should fail validation when lot_unit_cost is negative', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_unit_cost: -10
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_unit_cost' && error.msg === 'lot_unit_cost must be a positive number'
      )).toBe(true);
    });

    it('should fail validation when lot_unit_cost is not a number', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_unit_cost: 'not-a-number'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_unit_cost' && error.msg === 'lot_unit_cost must be a number, not a string'
      )).toBe(true);
    });

    it('should fail validation when expiration_date is not YYYY-MM-DD format', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        expiration_date: '2024-12-31T00:00:00.000Z'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'expiration_date' && error.msg === 'expiration_date must be a valid date'
      )).toBe(true);
    });

  });

  describe('GET /api/v1/inventory/lots/variant/:variantId - Get Lots by Variant', () => {
    it('should get lots by valid variant ID', async () => {
      const res = await request(app)
        .get(`/api/v1/inventory/lots/variant/${inventoryVariant.inv_var_id}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fail validation when variantId is not a number', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/variant/not-a-number')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'variantId' && error.msg === 'You must send a valid variantId'
      )).toBe(true);
    });

    it('should fail validation when variantId is less than 1', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/variant/0')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'variantId' && error.msg === 'You must send a valid variantId'
      )).toBe(true);
    });
  });

  describe('GET /api/v1/inventory/lots/search/:lotNumber - Search Lots', () => {
    it('should search lots by valid lot number', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/search/LOT123')
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should fail validation when lotNumber exceeds 100 characters', async () => {
      const longLotNumber = 'A'.repeat(101);
      const res = await request(app)
        .get(`/api/v1/inventory/lots/search/${longLotNumber}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lotNumber' && error.msg === 'lotNumber must be a string (max 100 chars)'
      )).toBe(true);
    });
  });

  describe('GET /api/v1inventory/lots/:id - Get Lot by ID', () => {
    let createdLotId: number;

    beforeAll(async () => {
      // Create a test lot for these tests
      const lotData = {
        inv_var_id: inventoryVariant2.inv_var_id,
        lot_number: 'LOTGETBYID',
        lot_status: 1
      };

      const createRes = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(lotData);

      createdLotId = createRes.body.data.inv_lot_id;
    });

    it('should get lot by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/inventory/lots/${createdLotId}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inv_lot_id).toBe(createdLotId);
    });

    it('should fail validation when ID is not a number', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/not-a-number')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'id' && error.msg === 'You must send a valid id'
      )).toBe(true);
    });

    it('should fail validation when ID is less than 1', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/0')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'id' && error.msg === 'You must send a valid id'
      )).toBe(true);
    });
  });

  describe('PUT /api/v1inventory/lots/:id - Update Lot', () => {
    let createdLotId: number;

    beforeAll(async () => {
      // Create a test lot for these tests
      const lotData = {
        inv_var_id: inventoryVariant3.inv_var_id,
        lot_number: 'LOTUPDATE',
        lot_status: 1
      };

      const createRes = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(lotData);

      createdLotId = createRes.body.data.inv_lot_id;
    });

    it('should update lot with valid data', async () => {
      const updateData = {
        lot_status: 0,
        lot_notes: 'Updated notes'
      };

      const res = await request(app)
        .put(`/api/v1/inventory/lots/${createdLotId}`)
        .set(authHeader(token))
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lot_status).toBe(0);
      expect(res.body.data.lot_notes).toBe('Updated notes');
    });

    it('should fail validation when updating with invalid lot_status', async () => {
      const invalidData = {
        lot_status: 2
      };

      const res = await request(app)
        .put(`/api/v1/inventory/lots/${createdLotId}`)
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((error: any) => 
        error.path === 'lot_status' && error.msg === 'lot_status must be 0 or 1'
      )).toBe(true);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should fail without authentication token', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .send({
          inv_var_id: inventoryVariant.inv_var_id,
          lot_number: 'LOT123'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with invalid authentication token', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set({ Authorization: 'Bearer invalid-token' })
        .send({
          inv_var_id: inventoryVariant.inv_var_id,
          lot_number: 'LOT123'
        });

      expect(res.statusCode).toBe(401);
    });
  });
}); 