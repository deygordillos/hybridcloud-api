import { InventoryFamilyService } from "../../src/services/InventoryFamilyService";
import { appDataSource } from '../../src/app-data-source';
import { createTestCompany } from "../helpers/setupTestData";
import { Companies } from "../../src/entity/companies.entity";

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
});