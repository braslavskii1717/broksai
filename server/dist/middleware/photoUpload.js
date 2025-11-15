"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.photoUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const storage = multer_1.default.memoryStorage();
exports.photoUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Допустимы только JPG/PNG изображения'));
        }
    },
}).single('photo');
