import { Router } from 'express';
import { createProperty, getProperty, listProperties } from '../controllers/propertyController';

const router = Router();

router.get('/', listProperties);
router.get('/:id', getProperty);
router.post('/', createProperty);

export default router;
