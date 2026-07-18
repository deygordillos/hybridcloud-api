import request from 'supertest';
import app from '../../../src/app';
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany, createTestUserAndToken, authHeader } from '../../helpers/setupTestData';
import { Currencies } from '../../../src/entity/currencies.entity';
import { CurrenciesExchanges } from '../../../src/entity/currencies_exchanges.entity';
import { Customers } from '../../../src/entity/customers.entity';
import { InventoryFamily } from '../../../src/entity/inventoryFamily.entity';
import { Inventory } from '../../../src/entity/inventory.entity';
import { InventoryVariants } from '../../../src/entity/inventory_variants.entity';
import { InventoryStorage } from '../../../src/entity/inventoryStorage.entity';
import { InventoryVariantStorages } from '../../../src/entity/inventory_variant_storages.entity';

let token: string;
let company: any;
let userId: number;
let customer: Customers;
let variant: InventoryVariants;
let storage: InventoryStorage;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  company = await createTestCompany();
  const { access_token, data: user } = await createTestUserAndToken(company);
  token = access_token;
  userId = user.user_id;

  const usd = await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'USD', currency_name: 'Dólar', currency_symbol: '$', currency_type: 1, currency_status: 1
  });
  // Crear la tasa vía API para que se registre también en el historial
  await request(app)
    .post('/api/v1/currencies-exchanges')
    .set(authHeader(token, company.company_id))
    .send({
      currency_id: usd.currency_id,
      currency_exc_rate: 120,
      currency_exc_type: 2,
      exchange_method: 2,
      currency_exc_status: 1
    });

  customer = await appDataSource.getRepository(Customers).save({
    company_id: company, cust_code: 'CLI-D', cust_id_fiscal: 'J-2222', cust_description: 'Cliente Dash', cust_status: 1, cust_exempt: 0,
  });

  const family = await appDataSource.getRepository(InventoryFamily).save({
    company_id: company, inv_family_code: 'FAMD', inv_family_name: 'Familia Dash', inv_family_status: 1
  });
  const inventory = await appDataSource.getRepository(Inventory).save({
    id_inv_family: family, inv_code: 'PRODD', inv_description: 'Producto Dash',
    inv_status: 1, inv_type: 1, inv_has_variants: 0, inv_is_exempt: 1, inv_is_stockable: 1, inv_is_lot_managed: 0,
  } as any);
  variant = await appDataSource.getRepository(InventoryVariants).save({
    inv_id: inventory.inv_id, inv_var_sku: 'PRODD-SKU', inv_var_status: 1
  });
  storage = await appDataSource.getRepository(InventoryStorage).save({
    company_id: company, inv_storage_code: 'DEPD', inv_storage_name: 'Depósito Dash', inv_storage_status: 1
  });
  await appDataSource.getRepository(InventoryVariantStorages).save({
    inv_var_id: variant.inv_var_id, id_inv_storage: storage.id_inv_storage,
    inv_vs_stock: 3, inv_vs_stock_reserved: 0, inv_vs_stock_committed: 0,
    inv_vs_stock_prev: 0, inv_vs_stock_min: 5, user_id: userId,
  });

  // Crear un pedido y llevarlo hasta facturado
  const createRes = await request(app)
    .post('/api/v1/orders')
    .set(authHeader(token, company.company_id))
    .send({
      cust_id: customer.cust_id,
      id_inv_storage: storage.id_inv_storage,
      items: [{ inv_var_id: variant.inv_var_id, quantity: 2, price_unit_stable: 15, price_unit_local: 1800 }],
    });
  const orderId = createRes.body.data.order_id;
  for (const status of [2, 3, 4]) {
    await request(app)
      .post(`/api/v1/orders/${orderId}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status });
  }
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Dashboard Routes', () => {
  it('GET /api/v1/dashboard/summary - debe devolver KPIs con ventas facturadas', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.sales.invoiced_orders).toBe(1);
    expect(Number(res.body.data.sales.total_stable)).toBeCloseTo(30, 1);
    expect(res.body.data.orders_by_status.invoiced).toBe(1);
    expect(res.body.data.active_customers).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/dashboard/sales - debe devolver la serie temporal', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/sales?group_by=day')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(Number(res.body.data[0].total_stable)).toBeCloseTo(30, 1);
  });

  it('GET /api/v1/dashboard/top-products - debe devolver el producto vendido', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/top-products')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].sku).toBe('PRODD-SKU');
    expect(Number(res.body.data[0].quantity)).toBeCloseTo(2, 2);
  });

  it('GET /api/v1/dashboard/low-stock - debe detectar stock bajo el mínimo', async () => {
    // Stock inicial 3, despachado 2 → queda 1, mínimo 5
    const res = await request(app)
      .get('/api/v1/dashboard/low-stock')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].stock).toBeLessThanOrEqual(res.body.data[0].stock_min);
  });

  it('GET /api/v1/dashboard/exchange-rate - debe devolver historial de tasa', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/exchange-rate?days=30')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(Number(res.body.data[0].rate)).toBe(120);
  });

  it('GET /api/v1/dashboard/recent-activity - debe listar actividad de auditoría', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/recent-activity')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
