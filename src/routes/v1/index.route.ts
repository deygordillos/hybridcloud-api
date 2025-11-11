import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'
import groupsRoutes from './groups.route'
import companiesRoutes from './companies.route'
import taxesRoutes from './taxes.route'
import coinsRoutes from './coins.route'
import customersRoute from './customers.route'
import inventoryRoutes from './inventory.route'
import inventoryFamilyRoutes from './inventory_family.route'
import inventoryStorageRoutes from './inventory_storage.route'
import inventoryAttrsRoutes from './inventory_attributes.route'
import inventoryLotsRoutes from './inventory_lots.route'
import inventoryPricesRoutes from './inventory_prices.route'
import inventoryVariantStoragesRoutes from './inventory_variant_storages.route'
import inventoryLotsStoragesRoutes from './inventory_lots_storages.route'
import inventoryMovementsRoutes from './inventory_movements.route'
import typesOfPrices from './types_of_prices.route'
import currenciesExchangesRoutes from './currencies_exchanges.route'

const router = Router();
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', usersRoutes);
router.use('/api/v1/groups', groupsRoutes);
router.use('/api/v1/companies', companiesRoutes);
router.use('/api/v1/customers', customersRoute);
router.use('/api/v1/taxes', taxesRoutes);
router.use('/api/v1/coins', coinsRoutes);
router.use('/api/v1/inventory', inventoryRoutes);
router.use('/api/v1/inventory/family', inventoryFamilyRoutes);
router.use('/api/v1/inventory/storage', inventoryStorageRoutes);
router.use('/api/v1/inventory/attributes', inventoryAttrsRoutes);
router.use('/api/v1/inventory/lots', inventoryLotsRoutes);
router.use('/api/v1/inventory/prices', inventoryPricesRoutes);
router.use('/api/v1/inventory/variant-storages', inventoryVariantStoragesRoutes);
router.use('/api/v1/inventory/lots-storages', inventoryLotsStoragesRoutes);
router.use('/api/v1/inventory/movements', inventoryMovementsRoutes);
router.use('/api/v1/types-of-prices', typesOfPrices);
router.use('/api/v1/currencies-exchanges', currenciesExchangesRoutes);

export default router