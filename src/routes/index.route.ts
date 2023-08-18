import { Router } from 'express'
import authRoutes from './auth.route'
import usersRoutes from './users.route'

const router = Router();

router.use('/v1/', authRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/users', usersRoutes);

export default router