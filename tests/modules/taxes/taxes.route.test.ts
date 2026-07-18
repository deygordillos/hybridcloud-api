import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany, createTestUserAndToken, authHeader } from '../../helpers/setupTestData';
import { Currencies } from '../../../src/entity/currencies.entity';

let token: string;
let company: any;
let currencyUsd: Currencies;

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

  currencyUsd = await appDataSource.getRepository(Currencies).save({
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

describe('Taxes Routes', () => {
  let percentTaxId: number;
  let fixedTaxId: number;

  it('POST /api/v1/taxes - debe crear un impuesto tipo porcentaje (IVA)', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'IVA',
        tax_name: 'Impuesto al Valor Agregado',
        tax_description: 'IVA general',
        tax_type: 2,
        tax_value: 16,
        tax_status: 1
      });
    expect(res.status).toBe(201);
    expect(res.body.data.tax_type).toBe(2);
    expect(Number(res.body.data.tax_value)).toBe(16);
    percentTaxId = res.body.data.tax_id;
  });

  it('POST /api/v1/taxes - debe crear un impuesto tipo fijo con currency_id', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'FIJO1',
        tax_name: 'Impuesto Fijo',
        tax_type: 3,
        tax_value: 1500.5,
        currency_id: currencyUsd.currency_id,
        tax_status: 1
      });
    expect(res.status).toBe(201);
    expect(res.body.data.tax_type).toBe(3);
    expect(res.body.data.currency_id).toBe(currencyUsd.currency_id);
    fixedTaxId = res.body.data.tax_id;
  });

  it('POST /api/v1/taxes - debe rechazar tipo fijo sin currency_id', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'FIJO2',
        tax_name: 'Impuesto Fijo Sin Moneda',
        tax_type: 3,
        tax_value: 100
      });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/taxes - debe rechazar un tax_type inválido', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'BAD',
        tax_name: 'Impuesto Inválido',
        tax_type: 9,
        tax_value: 10
      });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/taxes - impuesto exento fuerza tax_value = 0', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'EXENTO',
        tax_name: 'Exento',
        tax_type: 1,
        tax_value: 50
      });
    expect(res.status).toBe(201);
    expect(Number(res.body.data.tax_value)).toBe(0);
  });

  it('POST /api/v1/taxes - debe rechazar código duplicado en la misma empresa', async () => {
    const res = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'IVA',
        tax_name: 'Duplicado',
        tax_type: 2,
        tax_value: 8
      });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/taxes - debe listar los impuestos de la empresa', async () => {
    const res = await request(app)
      .get('/api/v1/taxes')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.recordsTotal).toBeGreaterThanOrEqual(3);
  });

  it('PUT /api/v1/taxes/:id - debe actualizar un impuesto a tipo fijo (bug corregido)', async () => {
    const res = await request(app)
      .put(`/api/v1/taxes/${percentTaxId}`)
      .set(authHeader(token, company.company_id))
      .send({
        tax_name: 'IVA convertido a fijo',
        tax_type: 3,
        tax_value: 250,
        currency_id: currencyUsd.currency_id
      });
    expect(res.status).toBe(200);
    expect(res.body.data.tax_type).toBe(3);
    expect(res.body.data.currency_id).toBe(currencyUsd.currency_id);
    expect(Number(res.body.data.tax_value)).toBe(250);
  });

  it('PUT /api/v1/taxes/:id - al volver a porcentaje limpia currency_id', async () => {
    const res = await request(app)
      .put(`/api/v1/taxes/${percentTaxId}`)
      .set(authHeader(token, company.company_id))
      .send({
        tax_name: 'IVA',
        tax_type: 2,
        tax_value: 16
      });
    expect(res.status).toBe(200);
    expect(res.body.data.tax_type).toBe(2);
    expect(res.body.data.currency_id).toBeNull();
  });

  it('PATCH /api/v1/taxes/:id - actualización parcial de status', async () => {
    const res = await request(app)
      .patch(`/api/v1/taxes/${fixedTaxId}`)
      .set(authHeader(token, company.company_id))
      .send({ tax_status: 0 });
    expect(res.status).toBe(200);
    expect(res.body.data.tax_status).toBe(0);
  });

  it('PUT /api/v1/taxes/:id - debe responder 404 para impuesto inexistente', async () => {
    const res = await request(app)
      .put('/api/v1/taxes/99999')
      .set(authHeader(token, company.company_id))
      .send({
        tax_name: 'No existe',
        tax_type: 2,
        tax_value: 10
      });
    expect(res.status).toBe(404);
  });

  it('GET /api/v1/taxes - debe rechazar solicitudes sin token', async () => {
    const res = await request(app).get('/api/v1/taxes');
    // authMiddleware responde 400 cuando no se envía el header Authorization
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Token no proporcionado');
  });
});
