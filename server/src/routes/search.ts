import { Router } from 'express';
import { searchProperties } from '../controllers/searchController';
import { validateSearchQuery } from '../middleware/validateSearchQuery';

const router = Router();

router.get('/', validateSearchQuery, searchProperties);

export default router;
