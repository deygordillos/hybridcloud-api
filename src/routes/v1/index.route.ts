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
import typesOfPricesRoutes from './types_of_prices.route'
import currenciesExchangesRoutes from './currencies_exchanges.route'
import { swaggerSpec, swaggerUi } from '../../swagger-config'

const router = Router();
router.use('/v1/auth', authRoutes);
router.use('/v1/users', usersRoutes);
router.use('/v1/groups', groupsRoutes);
router.use('/v1/companies', companiesRoutes);
router.use('/v1/customers', customersRoute);
router.use('/v1/taxes', taxesRoutes);
router.use('/v1/coins', coinsRoutes);
router.use('/v1/inventory', inventoryRoutes);
router.use('/v1/inventory/family', inventoryFamilyRoutes);
router.use('/v1/inventory/storage', inventoryStorageRoutes);
router.use('/v1/inventory/attributes', inventoryAttrsRoutes);
router.use('/v1/inventory/lots', inventoryLotsRoutes);
router.use('/v1/inventory/prices', inventoryPricesRoutes);
router.use('/v1/inventory/variant-storages', inventoryVariantStoragesRoutes);
router.use('/v1/inventory/lots-storages', inventoryLotsStoragesRoutes);
router.use('/v1/inventory/movements', inventoryMovementsRoutes);
router.use('/v1/types-of-prices', typesOfPricesRoutes);
router.use('/v1/currencies-exchanges', currenciesExchangesRoutes);

router.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.use('/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
export default router