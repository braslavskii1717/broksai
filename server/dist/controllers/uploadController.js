"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhotoController = uploadPhotoController;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const uploadsDir = path_1.default.resolve(__dirname, '../../uploads');
const ensureUploadsDir = async () => {
    await promises_1.default.mkdir(uploadsDir, { recursive: true });
};
async function uploadPhotoController(request, response) {
    try {
        if (!request.file) {
            return response.status(400).json({ message: 'Файл обязателен' });
        }
        await ensureUploadsDir();
        const safeName = `property-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
        const outputPath = path_1.default.join(uploadsDir, safeName);
        await (0, sharp_1.default)(request.file.buffer)
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(outputPath);
        const publicPath = `/uploads/${safeName}`;
        const publicUrl = process.env.CDN_URL ? `${process.env.CDN_URL}${publicPath}` : publicPath;
        return response.status(201).json({ url: publicUrl, path: publicPath });
    }
    catch (error) {
        console.error('uploadPhotoController error', error);
        return response.status(500).json({ message: 'Не удалось загрузить фото' });
    }
}
