import { Router } from 'express';
import { currentUser, login, register } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);

export default router;
