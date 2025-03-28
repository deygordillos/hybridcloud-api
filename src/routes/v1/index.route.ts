import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'
import groupsRoutes from './groups.route'
import companiesRoutes from './companies.route'
import taxesRoutes from './taxes.route'
import coinsRoutes from './coins.route'
import customersRoute from './customers.route'

const router = Router();

router.use('/api/v1/', authRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', usersRoutes);
router.use('/api/v1/groups', groupsRoutes);
router.use('/api/v1/companies', companiesRoutes);
router.use('/api/v1/customers', customersRoute);
router.use('/api/v1/taxes', taxesRoutes);
router.use('/api/v1/coins', coinsRoutes);


export default router