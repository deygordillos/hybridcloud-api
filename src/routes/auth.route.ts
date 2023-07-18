import { Router } from 'express'
import { authLogin, refreshLogin } from '../controllers/auth.controller';

const router = Router();
router.post('/login', authLogin);
router.post('/refresh', refreshLogin);

export default router