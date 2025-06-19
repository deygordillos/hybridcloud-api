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

const router = Router();

router.use('/api/v1/', authRoutes);
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

export default router