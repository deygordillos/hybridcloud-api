import { Router } from 'express'
import { authLogin } from '../controllers/auth.controller';

const router = Router();
router.post('/login', authLogin);

export default router