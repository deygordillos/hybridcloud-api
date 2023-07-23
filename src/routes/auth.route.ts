import { Router } from 'express'
import { authLogin, refreshLogin, testLogin } from '../controllers/auth.controller';
import { checkJwtMiddleware } from '../middlewares/check-jwt';

const router = Router();
router.post('/', testLogin);
router.post('/login', authLogin);
router.post('/refresh', refreshLogin);
router.post('/test', [checkJwtMiddleware], testLogin);

export default router