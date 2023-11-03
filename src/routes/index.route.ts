import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'
import groupsRoutes from './groups.route'
import companiesRoutes from './companies.route'
import sucursalesRoutes from './sucursales.route'
import taxesRoutes from './taxes.route'
import coinsRoutes from './coins.route'

const router = Router();

router.use('/v1/', authRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/users', usersRoutes);
router.use('/v1/groups', groupsRoutes);
router.use('/v1/companies', companiesRoutes);
router.use('/v1/sucursales', sucursalesRoutes);
router.use('/v1/taxes', taxesRoutes);
router.use('/v1/coins', coinsRoutes);


export default router