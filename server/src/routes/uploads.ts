import { Router } from 'express';
import { photoUpload } from '../middleware/photoUpload';
import { uploadPhotoController } from '../controllers/uploadController';

const router = Router();

router.post('/photo', (request, response) => {
  photoUpload(request, response, (error) => {
    if (error) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки файла';
      return response.status(400).json({ message });
    }
    uploadPhotoController(request, response);
  });
});

export default router;
