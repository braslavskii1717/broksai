import { Router } from 'express';
import { russianCities } from '../constants/cities';

const router = Router();

router.get('/', (_, res) => {
  res.json({ data: russianCities });
});

export default router;
