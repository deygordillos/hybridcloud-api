import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany, createTestUserAndToken, authHeader } from '../../helpers/setupTestData';

let token: string;
let company: any;

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

describe('Customers Routes', () => {
  let customerId: number;

  it('POST /api/v1/customers - debe crear un cliente', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set(authHeader(token, company.company_id))
      .send({
        cust_code: 'CLI001',
        cust_id_fiscal: 'J-12345678-9',
        cust_description: 'Cliente Prueba C.A.',
        cust_email: 'cliente@test.com',
        cust_telephone1: '+58 212 5551234',
      });
    expect(res.status).toBe(201);
    expect(res.body.customer.cust_code).toBe('CLI001');
    expect(res.body.customer.cust_id_fiscal).toBe('J-12345678-9');
    customerId = res.body.customer.cust_id;
  });

  it('POST /api/v1/customers - debe rechazar cliente sin cust_id_fiscal', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set(authHeader(token, company.company_id))
      .send({
        cust_code: 'CLI002',
        cust_description: 'Cliente sin RIF',
      });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/customers - debe rechazar email inválido', async () => {
    const res = await request(app)
      .post('/api/v1/customers')
      .set(authHeader(token, company.company_id))
      .send({
        cust_code: 'CLI003',
        cust_id_fiscal: 'V-11222333-4',
        cust_description: 'Cliente Email Malo',
        cust_email: 'no-es-un-email',
      });
    expect(res.status).toBe(400);
  });

  it('GET /api/v1/customers - debe listar los clientes de la empresa', async () => {
    const res = await request(app)
      .get('/api/v1/customers')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.customers)).toBe(true);
    expect(res.body.totalCustomers).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/v1/customers/:id - actualización parcial conserva los demás campos', async () => {
    const res = await request(app)
      .patch(`/api/v1/customers/${customerId}`)
      .set(authHeader(token, company.company_id))
      .send({ cust_address: 'Av. Principal, Caracas' });
    expect(res.status).toBe(200);

    const updated = res.body.data;
    expect(updated.cust_address).toBe('Av. Principal, Caracas');
    // Los campos no enviados no deben perderse ni cambiar
    expect(updated.cust_description).toBe('Cliente Prueba C.A.');
    expect(updated.cust_email).toBe('cliente@test.com');
    // cust_exempt no enviado: debe conservar su valor por defecto (0)
    expect(updated.cust_exempt).toBe(0);
  });

  it('PUT /api/v1/customers/:id - debe actualizar estado y exención', async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${customerId}`)
      .set(authHeader(token, company.company_id))
      .send({
        cust_description: 'Cliente Prueba Actualizado C.A.',
        cust_status: 0,
        cust_exempt: 1,
      });
    expect(res.status).toBe(200);
    expect(res.body.data.cust_description).toBe('Cliente Prueba Actualizado C.A.');
    expect(res.body.data.cust_status).toBe(0);
    expect(res.body.data.cust_exempt).toBe(1);
  });

  it('PUT /api/v1/customers/:id - debe fallar para cliente inexistente', async () => {
    const res = await request(app)
      .put('/api/v1/customers/99999')
      .set(authHeader(token, company.company_id))
      .send({ cust_description: 'No existe' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('GET /api/v1/customers - debe rechazar solicitudes sin token', async () => {
    const res = await request(app).get('/api/v1/customers');
    expect(res.status).toBe(400);
  });
});
