import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../../helpers/setupTestData';
import { Companies } from '../../../src/entity/companies.entity';

let company: Companies;
let token: string;
let createdFamilyId: number;

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
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Inventory Family Routes', () => {
  it('should create an inventory family', async () => {
    const res = await request(app)
      .post('/api/v1/inventory/family')
      .set(authHeader(token, company.company_id))
      .send({ 
        inv_family_code: '01',
        inv_family_name: 'Shoes' 
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id_inv_family');
    expect(res.body.data.inv_family_name).toBe('Shoes');
    createdFamilyId = res.body.data.id_inv_family;
  });

  it('should get inventory families', async () => {
    const res = await request(app)
      .get('/api/v1/inventory/family')
      .set(authHeader(token, company.company_id));
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('currentPage');
  });

  it('should update an inventory family with full body (PUT)', async () => {
    const res = await request(app)
      .put(`/api/v1/inventory/family/${createdFamilyId}`)
      .set(authHeader(token, company.company_id))
      .send({
        inv_family_name: 'Shoes Updated',
        inv_family_status: 1,
        inv_is_stockable: 1,
        inv_is_lot_managed: 0
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it('should update an inventory family with partial body (PATCH) - no inv_family_name', async () => {
    const res = await request(app)
      .patch(`/api/v1/inventory/family/${createdFamilyId}`)
      .set(authHeader(token, company.company_id))
      .send({ inv_family_status: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it('should update an inventory family with empty body (PATCH) without error', async () => {
    const res = await request(app)
      .patch(`/api/v1/inventory/family/${createdFamilyId}`)
      .set(authHeader(token, company.company_id))
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating a non-existent inventory family', async () => {
    const res = await request(app)
      .put('/api/v1/inventory/family/999999')
      .set(authHeader(token, company.company_id))
      .send({ inv_family_status: 1 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when creating a duplicate inventory family code', async () => {
    const res = await request(app)
      .post('/api/v1/inventory/family')
      .set(authHeader(token, company.company_id))
      .send({
        inv_family_code: '01',
        inv_family_name: 'Shoes Duplicate'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});