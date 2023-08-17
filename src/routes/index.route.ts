import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'

const router = Router();

router.use('/', authRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export default router