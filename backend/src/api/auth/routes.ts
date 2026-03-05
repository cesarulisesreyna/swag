import { Router } from 'express';
import { login, me } from './controller';
import { checkAuth } from '../../middlewares/checkAuth';

const router = Router();

router.post('/login', login);
router.get('/me', checkAuth, me);

export default router;
