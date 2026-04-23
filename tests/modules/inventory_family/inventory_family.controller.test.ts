import { InventoryFamilyService } from "../../../src/services/InventoryFamilyService";
import { appDataSource } from '../../../src/app-data-source';
import { createTestCompany } from "../../helpers/setupTestData";
import { Companies } from "../../../src/entity/companies.entity";

let company: Companies;

beforeAll(async () => {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
  }
  process.env.NODE_ENV = 'test';
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  company = await createTestCompany()
});

afterAll(async () => {
  await appDataSource.destroy();
});

describe('Inventory Family Service', () => {
  it('should create an inventory family', async () => {

    const inventory_family = await InventoryFamilyService.create({
      company_id: company,
      inv_family_code: '01',
      inv_family_name: 'Shoes',
      inv_family_status: 1,
      inv_is_stockable: 0,
      inv_is_lot_managed: 0,
      tax_id: null
    });
    console.log({inventory_family})
    expect(inventory_family).toHaveProperty('id_inv_family');
    expect(inventory_family.inv_family_name).toBe('Shoes');
  });

  it('should get all inventory family', async () => {
    const { data, total } = await InventoryFamilyService.getInventoryFamilyByCompanyId(company.company_id);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should update an inventory family with full body', async () => {
    const created = await InventoryFamilyService.create({
      company_id: company,
      inv_family_code: '02',
      inv_family_name: 'Shirts',
      inv_family_status: 1,
      inv_is_stockable: 1,
      inv_is_lot_managed: 0,
      tax_id: null
    });

    const result = await InventoryFamilyService.update(created, {
      inv_family_name: 'Shirts Updated',
      inv_family_status: 0,
      inv_is_stockable: 0,
      inv_is_lot_managed: 1,
      tax_id: null
    });

    expect(result).toHaveProperty('message');
    expect(created.inv_family_name).toBe('Shirts Updated');
    expect(created.inv_family_status).toBe(0);
  });

  it('should update an inventory family with partial body - no inv_family_name', async () => {
    const created = await InventoryFamilyService.create({
      company_id: company,
      inv_family_code: '03',
      inv_family_name: 'Pants',
      inv_family_status: 1,
      inv_is_stockable: 1,
      inv_is_lot_managed: 0,
      tax_id: null
    });

    // Should NOT throw "Cannot read properties of undefined (reading 'length')"
    const result = await InventoryFamilyService.update(created, {
      inv_family_status: 0
    });

    expect(result).toHaveProperty('message');
    expect(created.inv_family_name).toBe('Pants'); // unchanged
    expect(created.inv_family_status).toBe(0);     // updated
    expect(created.inv_is_stockable).toBe(1);      // unchanged
  });

  it('should not modify fields when empty body is sent', async () => {
    const created = await InventoryFamilyService.create({
      company_id: company,
      inv_family_code: '04',
      inv_family_name: 'Hats',
      inv_family_status: 1,
      inv_is_stockable: 1,
      inv_is_lot_managed: 0,
      tax_id: null
    });

    await InventoryFamilyService.update(created, {});

    expect(created.inv_family_name).toBe('Hats');
    expect(created.inv_family_status).toBe(1);
    expect(created.inv_is_stockable).toBe(1);
    expect(created.inv_is_lot_managed).toBe(0);
  });
});