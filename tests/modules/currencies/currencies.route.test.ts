import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany, createTestUserAndToken, authHeader } from '../../helpers/setupTestData';
import { Currencies } from '../../../src/entity/currencies.entity';

let token: string;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  const company = await createTestCompany();
  const { access_token } = await createTestUserAndToken(company);
  token = access_token;

  await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'USD',
    currency_name: 'Dólar',
    currency_symbol: '$',
    currency_type: 1,
    currency_status: 1
  });
  await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'XXX',
    currency_name: 'Inactiva',
    currency_symbol: 'X',
    currency_type: 1,
    currency_status: 0
  });
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Currencies Catalog Routes', () => {
  it('GET /api/v1/currencies - debe listar el catálogo de monedas activas', async () => {
    const res = await request(app)
      .get('/api/v1/currencies')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // La migración siembra VES; el seed del test agrega USD
    const isoCodes = res.body.data.map((c: any) => c.currency_iso_code);
    expect(isoCodes).toContain('USD');
    expect(isoCodes).not.toContain('XXX');
  });

  it('GET /api/v1/currencies?status=0 - debe listar monedas inactivas', async () => {
    const res = await request(app)
      .get('/api/v1/currencies?status=0')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    const isoCodes = res.body.data.map((c: any) => c.currency_iso_code);
    expect(isoCodes).toContain('XXX');
  });

  it('GET /api/v1/currencies - debe rechazar paginación inválida', async () => {
    const res = await request(app)
      .get('/api/v1/currencies?page=0')
      .set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/currencies - debe rechazar solicitudes sin token', async () => {
    const res = await request(app).get('/api/v1/currencies');
    expect(res.status).toBe(400);
  });
});
