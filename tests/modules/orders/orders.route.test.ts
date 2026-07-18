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
import { InventoryMovements } from '../../../src/entity/inventory_movements.entity';
import { Taxes } from '../../../src/entity/taxes.entity';
import { InventoryTaxes } from '../../../src/entity/inventory_taxes.entity';

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

  // Monedas y tasas: local VES, stable USD tasa 100 MULTIPLY
  const ves = await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'VE2', currency_name: 'Bolívar Test', currency_symbol: 'Bs', currency_type: 1, currency_status: 1
  });
  const usd = await appDataSource.getRepository(Currencies).save({
    currency_iso_code: 'USD', currency_name: 'Dólar', currency_symbol: '$', currency_type: 1, currency_status: 1
  });
  await appDataSource.getRepository(CurrenciesExchanges).save({
    company_id: company.company_id, currency_id: ves.currency_id,
    currency_exc_rate: 1, currency_exc_type: 1, exchange_method: 2, currency_exc_status: 1
  });
  await appDataSource.getRepository(CurrenciesExchanges).save({
    company_id: company.company_id, currency_id: usd.currency_id,
    currency_exc_rate: 100, currency_exc_type: 2, exchange_method: 2, currency_exc_status: 1
  });

  // Cliente
  customer = await appDataSource.getRepository(Customers).save({
    company_id: company,
    cust_code: 'CLI001',
    cust_id_fiscal: 'J-11111111-1',
    cust_description: 'Cliente Pedidos',
    cust_status: 1,
    cust_exempt: 0,
  });

  // Impuesto IVA 16%
  const tax = await appDataSource.getRepository(Taxes).save({
    company_id: company, tax_code: 'IVA', tax_name: 'IVA', tax_type: 2, tax_value: 16, tax_status: 1
  });

  // Familia + producto + variante
  const family = await appDataSource.getRepository(InventoryFamily).save({
    company_id: company, inv_family_code: 'FAM1', inv_family_name: 'Familia Test', inv_family_status: 1
  });
  const inventory = await appDataSource.getRepository(Inventory).save({
    id_inv_family: family,
    inv_code: 'PROD1',
    inv_description: 'Producto Test',
    inv_status: 1,
    inv_type: 1,
    inv_has_variants: 0,
    inv_is_exempt: 0,
    inv_is_stockable: 1,
    inv_is_lot_managed: 0,
  } as any);
  await appDataSource.getRepository(InventoryTaxes).save({
    inv_id: inventory.inv_id, tax_id: tax.tax_id
  });
  variant = await appDataSource.getRepository(InventoryVariants).save({
    inv_id: inventory.inv_id, inv_var_sku: 'PROD1-SKU', inv_var_status: 1
  });

  // Depósito con stock 50
  storage = await appDataSource.getRepository(InventoryStorage).save({
    company_id: company, inv_storage_code: 'DEP1', inv_storage_name: 'Depósito Principal', inv_storage_status: 1
  });
  await appDataSource.getRepository(InventoryVariantStorages).save({
    inv_var_id: variant.inv_var_id,
    id_inv_storage: storage.id_inv_storage,
    inv_vs_stock: 50,
    inv_vs_stock_reserved: 0,
    inv_vs_stock_committed: 0,
    inv_vs_stock_prev: 0,
    inv_vs_stock_min: 5,
    user_id: userId,
  });
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Orders Routes', () => {
  let orderId: number;

  it('POST /api/v1/orders - debe crear un pedido borrador con totales en 3 monedas', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set(authHeader(token, company.company_id))
      .send({
        cust_id: customer.cust_id,
        id_inv_storage: storage.id_inv_storage,
        order_notes: 'Pedido de prueba',
        items: [
          {
            inv_var_id: variant.inv_var_id,
            quantity: 2,
            price_unit_stable: 10, // 10 USD
            price_unit_local: 1000, // tasa 100
            discount_percent: 0,
          },
        ],
      });

    expect(res.status).toBe(201);
    const order = res.body.data;
    orderId = order.order_id;

    expect(order.order_code).toBe('PED-000001');
    expect(order.order_status).toBe(1);
    // subtotal: 2 × 10 = 20 USD / 2000 VES; IVA 16% → total 23.2 USD / 2320 VES
    expect(Number(order.subtotal_stable)).toBeCloseTo(20, 2);
    expect(Number(order.tax_total_stable)).toBeCloseTo(3.2, 2);
    expect(Number(order.total_stable)).toBeCloseTo(23.2, 2);
    expect(Number(order.total_local)).toBeCloseTo(2320, 2);
    // Snapshot de tasa
    expect(Number(order.exchange_rate_stable)).toBe(100);
  });

  it('GET /api/v1/orders - debe listar pedidos de la empresa', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.recordsTotal).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].customer).toBeDefined();
  });

  it('GET /api/v1/orders/:id - debe traer el pedido con items', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(Number(res.body.data.items[0].quantity)).toBe(2);
  });

  it('PUT /api/v1/orders/:id - debe actualizar un borrador y recalcular totales', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}`)
      .set(authHeader(token, company.company_id))
      .send({
        items: [
          {
            inv_var_id: variant.inv_var_id,
            quantity: 5,
            price_unit_stable: 10,
            price_unit_local: 1000,
            discount_percent: 10,
          },
        ],
      });
    expect(res.status).toBe(200);
    // 5×10=50, desc 10% = 5 → base 45, IVA 16% = 7.2 → total 52.2 USD
    expect(Number(res.body.data.total_stable)).toBeCloseTo(52.2, 2);
  });

  it('POST /api/v1/orders/:id/status - transición inválida borrador→facturado debe fallar', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status: 4 });
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/orders/:id/status - debe confirmar el pedido (re-snapshot tasa)', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.order_status).toBe(2);
    expect(res.body.data.confirmed_at).toBeDefined();
  });

  it('PUT /api/v1/orders/:id - no debe permitir editar un pedido confirmado', async () => {
    const res = await request(app)
      .put(`/api/v1/orders/${orderId}`)
      .set(authHeader(token, company.company_id))
      .send({ order_notes: 'Intento de edición' });
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/orders/:id/status - despachar debe generar movimiento y descontar stock', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status: 3 });
    expect(res.status).toBe(200);
    expect(res.body.data.order_status).toBe(3);

    // Stock 50 - 5 = 45
    const storageRow = await appDataSource.getRepository(InventoryVariantStorages).findOneBy({
      inv_var_id: variant.inv_var_id,
      id_inv_storage: storage.id_inv_storage,
    });
    expect(Number(storageRow?.inv_vs_stock)).toBeCloseTo(45, 2);

    // Movimiento de salida generado
    const movement = await appDataSource.getRepository(InventoryMovements).findOneBy({
      inv_var_id: variant.inv_var_id,
      related_doc: 'PED-000001',
    });
    expect(movement).toBeDefined();
    expect(movement?.movement_type).toBe(2);
    expect(Number(movement?.quantity)).toBeCloseTo(5, 2);
  });

  it('POST /api/v1/orders/:id/status - debe facturar el pedido', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${orderId}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status: 4 });
    expect(res.status).toBe(200);
    expect(res.body.data.order_status).toBe(4);
    expect(res.body.data.invoiced_at).toBeDefined();
  });

  it('DELETE /api/v1/orders/:id - no debe eliminar un pedido facturado', async () => {
    const res = await request(app)
      .delete(`/api/v1/orders/${orderId}`)
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(409);
  });

  it('POST /api/v1/orders - debe rechazar pedido con stock insuficiente al confirmar', async () => {
    const createRes = await request(app)
      .post('/api/v1/orders')
      .set(authHeader(token, company.company_id))
      .send({
        cust_id: customer.cust_id,
        id_inv_storage: storage.id_inv_storage,
        items: [
          { inv_var_id: variant.inv_var_id, quantity: 1000, price_unit_stable: 10 },
        ],
      });
    expect(createRes.status).toBe(201);

    const confirmRes = await request(app)
      .post(`/api/v1/orders/${createRes.body.data.order_id}/status`)
      .set(authHeader(token, company.company_id))
      .send({ status: 2 });
    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.message).toContain('Insufficient stock');
  });

  it('POST /api/v1/orders - debe rechazar pedido sin items', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set(authHeader(token, company.company_id))
      .send({ cust_id: customer.cust_id, items: [] });
    expect(res.status).toBe(400);
  });

  it('el pedido genera auditoría CREATE y STATUS_CHANGE', async () => {
    const res = await request(app)
      .get(`/api/v1/audit-logs?entity_type=orders&entity_id=${orderId}`)
      .set(authHeader(token, company.company_id));
    expect(res.status).toBe(200);

    const actions = res.body.data.map((log: any) => log.action_type);
    expect(actions).toContain('CREATE');
    expect(actions).toContain('STATUS_CHANGE');
  });
});
