import { Router } from 'express';
import { validateFilters } from '../middleware/validateFilters';
import type { SearchFilters } from '../types/filters';
import { searchService } from '../services/searchService';
import { filterService } from '../services/filterService';
import { Property } from '../models/Property';

const router = Router();

router.get('/', validateFilters, async (req, res) => {
  try {
    const filters: SearchFilters = res.locals.searchFilters;
    const response = await searchService.search(filters);
    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/filters', async (req, res) => {
  try {
    const availableOptions = await filterService.getAvailableFilters(Property);
    res.json({ availableOptions });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
