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

describe('Audit Logs', () => {
  let taxId: number;

  it('crear un impuesto debe generar un registro de auditoría CREATE', async () => {
    const createRes = await request(app)
      .post('/api/v1/taxes')
      .set(authHeader(token, company.company_id))
      .send({
        tax_code: 'IVA',
        tax_name: 'IVA Auditado',
        tax_type: 2,
        tax_value: 16,
      });
    expect(createRes.status).toBe(201);
    taxId = createRes.body.data.tax_id;

    const res = await request(app)
      .get('/api/v1/audit-logs?entity_type=taxes')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.recordsTotal).toBeGreaterThanOrEqual(1);

    const entry = res.body.data.find(
      (log: any) => log.entity_id === taxId && log.action_type === 'CREATE'
    );
    expect(entry).toBeDefined();
    expect(entry.changes_data.after.tax_name).toBe('IVA Auditado');
    expect(entry.changed_by).toBeDefined();
  });

  it('actualizar un impuesto debe registrar UPDATE con diff de campos', async () => {
    const updateRes = await request(app)
      .put(`/api/v1/taxes/${taxId}`)
      .set(authHeader(token, company.company_id))
      .send({
        tax_name: 'IVA Renombrado',
        tax_type: 2,
        tax_value: 8,
      });
    expect(updateRes.status).toBe(200);

    const res = await request(app)
      .get(`/api/v1/audit-logs?entity_type=taxes&entity_id=${taxId}`)
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);

    const entry = res.body.data.find((log: any) => log.action_type === 'UPDATE');
    expect(entry).toBeDefined();
    // El diff debe contener solo los campos que cambiaron
    expect(entry.changes_data.after.tax_name).toBe('IVA Renombrado');
    expect(entry.changes_data.before.tax_name).toBe('IVA Auditado');
    expect(Number(entry.changes_data.after.tax_value)).toBe(8);
  });

  it('crear un cliente debe generar auditoría CREATE de customers', async () => {
    const createRes = await request(app)
      .post('/api/v1/customers')
      .set(authHeader(token, company.company_id))
      .send({
        cust_code: 'CLI-AUD',
        cust_id_fiscal: 'J-99887766-5',
        cust_description: 'Cliente Auditado',
      });
    expect(createRes.status).toBe(201);

    const res = await request(app)
      .get('/api/v1/audit-logs?entity_type=customers')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.recordsTotal).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/audit-logs - debe rechazar solicitudes sin token', async () => {
    const res = await request(app).get('/api/v1/audit-logs');
    expect(res.status).toBe(400);
  });
});
