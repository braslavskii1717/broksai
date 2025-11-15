import multer from 'multer';

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const storage = multer.memoryStorage();

export const photoUpload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Допустимы только JPG/PNG изображения'));
    }
  },
}).single('photo');
