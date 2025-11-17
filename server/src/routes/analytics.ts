import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { createRateLimiter } from '../middleware/rateLimit';
import {
  getFailedQueries,
  getPopularQueries,
  getSearchStats,
  getSlowQueries,
} from '../controllers/analyticsController';

const router = Router();
const analyticsRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10 });

router.use(requireAuth, requireAdmin, analyticsRateLimiter.middleware);

router.get('/popular', getPopularQueries);
router.get('/failed', getFailedQueries);
router.get('/slow', getSlowQueries);
router.get('/stats', getSearchStats);

export function resetAnalyticsRateLimiter() {
  analyticsRateLimiter.reset();
}

export default router;
