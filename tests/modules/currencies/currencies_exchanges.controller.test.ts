import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany, createTestUserAndToken, authHeader } from '../../helpers/setupTestData';
import { Currencies } from '../../../src/entity/currencies.entity';
import { CurrenciesExchanges } from '../../../src/entity/currencies_exchanges.entity';

let token: string;
let company: any;
let currency1: Currencies;
let currency2: Currencies;
let currencyExchange: CurrenciesExchanges;

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

  // Crear monedas de prueba
  currency1 = await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'VES',
    currency_name: 'Bolívar',
    currency_symbol: 'Bs',
    currency_type: 1,
    currency_status: 1
  });
  currency2 = await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'USD',
    currency_name: 'Dólar',
    currency_symbol: '$',
    currency_type: 1,
    currency_status: 1
  });
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('CurrenciesExchangesController', () => {
  let createdId: number;

  it('create: debe crear una relación de moneda tipo stable', async () => {
    const res = await request(app)
      .post('/api/v1/currencies-exchanges')
      .set(authHeader(token))
      .send({
        currency_id: currency2.currency_id,
        currency_exc_rate: 100.12345678,
        currency_exc_type: 2, // stable
        exchange_method: 2,
        currency_exc_status: 1
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currency_id).toBe(currency2.currency_id);
    createdId = res.body.data.currency_exc_id;
    expect(res.body.data.currency_exc_type).toBe(2);
    // Verifica que el campo stable esté presente
    expect(res.body.data).toHaveProperty('currency_exc_type');
    // Si hay un campo currency_id_stable, verificarlo
    if ('currency_id_stable' in res.body.data) {
      expect(res.body.data.currency_id_stable).toBeDefined();
    }
  });

  it('getCompanyCurrencies: debe listar monedas de la empresa', async () => {
    const res = await request(app)
      .get('/api/v1/currencies-exchanges')
      .set(authHeader(token))
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('getCurrencyById: debe obtener una relación por id', async () => {
    const res = await request(app)
      .get(`/api/v1/currencies-exchanges/${createdId}`)
      .set(authHeader(token))
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currency_exc_id).toBe(createdId);
  });

  it('update: debe actualizar una relación a tipo stable', async () => {
    const res = await request(app)
      .put(`/api/v1/currencies-exchanges/${createdId}`)
      .set(authHeader(token))
      .send({ currency_exc_rate: 200.12345678, exchange_method: 1, currency_exc_type: 2 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currency_exc_rate).toBe(200.12345678);
    expect(res.body.data.exchange_method).toBe(1);
    expect(res.body.data.currency_exc_type).toBe(2);
    if ('currency_id_stable' in res.body.data) {
      expect(res.body.data.currency_id_stable).toBeDefined();
    }
  });

  it('getCurrencyHistory: debe devolver el historial', async () => {
    const res = await request(app)
      .get('/api/v1/currencies-exchanges/history')
      .set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('create: error de validación', async () => {
    const res = await request(app)
      .post('/api/v1/currencies-exchanges')
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('getCurrencyById: error id inválido', async () => {
    const res = await request(app)
      .get('/api/v1/currencies-exchanges/invalid')
      .set(authHeader(token));
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('getCurrencyById: error no encontrado', async () => {
    const res = await request(app)
      .get('/api/v1/currencies-exchanges/999999')
      .set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
}); 