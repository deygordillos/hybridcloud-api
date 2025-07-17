import request from 'supertest';
import app from '../../src/app';
import { appDataSource } from '../../src/app-data-source';
import { authHeader, createTestCompany, createTestUserAndToken } from '../helpers/setupTestData';
import { Companies } from '../../src/entity/companies.entity';

let company: Companies;
let token: string;

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
      .set(authHeader(token))
      .send({ 
        inv_family_code: '01',
        inv_family_name: 'Shoes' 
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id_inv_family');
    expect(res.body.data.inv_family_name).toBe('Shoes');
  });

  it('should get inventory families', async () => {
    const res = await request(app)
      .get('/api/v1/inventory/family')
      .set(authHeader(token));
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});