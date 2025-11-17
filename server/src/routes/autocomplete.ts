import { Router } from 'express';
import { autocompleteSearch } from '../controllers/autocompleteController';
import { validateAutocompleteQuery } from '../middleware/validateAutocompleteQuery';

const router = Router();

router.get('/', validateAutocompleteQuery, autocompleteSearch);

export default router;
