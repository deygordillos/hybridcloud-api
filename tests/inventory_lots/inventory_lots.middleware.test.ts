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

beforeAll(async () => {
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

describe('Inventory Lots - Express Validator Middleware Tests', () => {
  describe('POST /api/v1/inventory/lots - Validation Middleware', () => {
    it('should pass validation with all required fields', async () => {
      const validData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTVALID'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(validData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fail validation middleware when inv_var_id is missing', async () => {
      const invalidData = {
        lot_number: 'LOT123'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0]).toMatchObject({
        path: 'inv_var_id',
        msg: 'inv_var_id is required'
      });
    });

    it('should fail validation middleware when lot_number is missing', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toHaveLength(1);
      expect(res.body.errors[0]).toMatchObject({
        path: 'lot_number',
        msg: 'lot_number is required'
      });
    });

    it('should fail validation middleware with multiple errors', async () => {
      const invalidData = {
        inv_var_id: 'not-a-number',
        lot_number: 123,
        lot_status: 2
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(1);
      
      const errorPaths = res.body.errors.map((error: any) => error.path);
      expect(errorPaths).toContain('inv_var_id');
      expect(errorPaths).toContain('lot_number');
      expect(errorPaths).toContain('lot_status');
    });

    it('should fail validation middleware when inv_var_id is string instead of number', async () => {
      const invalidData = {
        inv_var_id: '123',
        lot_number: 'LOT123'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'inv_var_id',
        msg: 'inv_var_id must be a number, not a string'
      });
    });

    it('should fail validation middleware when lot_number is number instead of string', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 123
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'lot_number',
        msg: 'lot_number is required'
      });
    });

    it('should fail validation middleware when lot_unit_cost is string', async () => {
      const invalidData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOT123',
        lot_unit_cost: '25.50'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'lot_unit_cost',
        msg: 'lot_unit_cost must be a number, not a string'
      });
    });

    it('should pass validation middleware with valid optional fields', async () => {
      const validData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTOPTIONAL',
        lot_origin: 'Test Supplier',
        lot_status: 1,
        lot_unit_cost: 25.50,
        lot_unit_currency_id: 1
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(validData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/inventory/lots/variant/:variantId - Parameter Validation', () => {
    it('should pass validation with valid numeric variantId', async () => {
      const res = await request(app)
        .get(`/api/v1/inventory/lots/variant/${inventoryVariant.inv_var_id}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail validation middleware with non-numeric variantId', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/variant/abc')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'variantId',
        msg: 'variantId must be a number, not a string'
      });
    });

    it('should fail validation middleware with zero variantId', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/variant/0')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'variantId',
        msg: 'You must send a valid variantId'
      });
    });

    it('should fail validation middleware with negative variantId', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/variant/-1')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'variantId',
        msg: 'You must send a valid variantId'
      });
    });
  });

  describe('GET /api/v1/inventory/lots/search/:lotNumber - Parameter Validation', () => {
    it('should pass validation with valid lot number', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/search/LOT123')
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail validation middleware with empty lot number', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/lots/search/')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'lotNumber',
        msg: 'lotNumber is required'
      });
    });

    it('should fail validation middleware with lot number exceeding 100 characters', async () => {
      const longLotNumber = 'A'.repeat(101);
      const res = await request(app)
        .get(`/api/v1/inventory/lots/search/${longLotNumber}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'lotNumber',
        msg: 'lotNumber must be a string (max 100 chars)'
      });
    });
  });

  describe('PUT /api/v1/inventory/lots/:id - Update Validation', () => {
    let createdLotId: number;

    beforeAll(async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTUPDATE'
      };

      const createRes = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(lotData);

      createdLotId = createRes.body.data.inv_lot_id;
    });

    it('should pass validation middleware with valid update data', async () => {
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
    });

    it('should fail validation middleware with invalid lot_status', async () => {
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
      expect(res.body.errors[0]).toMatchObject({
        path: 'lot_status',
        msg: 'lot_status must be 0 or 1'
      });
    });

    it('should fail validation middleware with invalid ID parameter', async () => {
      const updateData = {
        lot_status: 0
      };

      const res = await request(app)
        .put('/api/v1/inventory/lots/abc')
        .set(authHeader(token))
        .send(updateData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'id',
        msg: 'id must be a number, not a string'
      });
    });
  });

  describe('DELETE /api/v1/inventory/lots/:id - Parameter Validation', () => {
    let createdLotId: number;

    beforeAll(async () => {
      const lotData = {
        inv_var_id: inventoryVariant.inv_var_id,
        lot_number: 'LOTDELETE'
      };

      const createRes = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(lotData);

      createdLotId = createRes.body.data.inv_lot_id;
    });

    it('should pass validation middleware with valid ID', async () => {
      const res = await request(app)
        .delete(`/api/v1/inventory/lots/${createdLotId}`)
        .set(authHeader(token));

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail validation middleware with invalid ID parameter', async () => {
      const res = await request(app)
        .delete('/api/v1/inventory/lots/abc')
        .set(authHeader(token));

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toMatchObject({
        path: 'id',
        msg: 'id must be a number, not a string'
      });
    });
  });

  describe('Authentication Middleware Integration', () => {
    it('should fail without authentication token', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .send({
          inv_var_id: inventoryVariant.inv_var_id,
          lot_number: 'LOT123'
        });

      expect(res.statusCode).toBe(401);
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

    it('should pass authentication but fail validation', async () => {
      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send({
          // Missing required fields
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('error');
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      const invalidData = {
        inv_var_id: 'not-a-number',
        lot_number: 123
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.message).toBe('error');
      expect(Array.isArray(res.body.errors)).toBe(true);
      
      res.body.errors.forEach((error: any) => {
        expect(error).toHaveProperty('path');
        expect(error).toHaveProperty('msg');
        expect(typeof error.path).toBe('string');
        expect(typeof error.msg).toBe('string');
      });
    });

    it('should return multiple validation errors in correct format', async () => {
      const invalidData = {
        inv_var_id: 'not-a-number',
        lot_number: 123,
        lot_status: 2,
        lot_unit_cost: 'invalid'
      };

      const res = await request(app)
        .post('/api/v1/inventory/lots')
        .set(authHeader(token))
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(1);
      
      const errorPaths = res.body.errors.map((error: any) => error.path);
      expect(errorPaths).toContain('inv_var_id');
      expect(errorPaths).toContain('lot_number');
      expect(errorPaths).toContain('lot_status');
      expect(errorPaths).toContain('lot_unit_cost');
    });
  });
}); 