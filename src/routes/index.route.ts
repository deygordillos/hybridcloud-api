import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'
import groupsRoutes from './groups.route'
import companiesRoutes from './companies.route'

const router = Router();

router.use('/v1/', authRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/users', usersRoutes);
router.use('/v1/groups', groupsRoutes);
router.use('/v1/companies', companiesRoutes);

export default router