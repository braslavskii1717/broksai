"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoUpload_1 = require("../middleware/photoUpload");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
router.post('/photo', (request, response) => {
    (0, photoUpload_1.photoUpload)(request, response, (error) => {
        if (error) {
            const message = error instanceof Error ? error.message : 'Ошибка загрузки файла';
            return response.status(400).json({ message });
        }
        (0, uploadController_1.uploadPhotoController)(request, response);
    });
});
exports.default = router;
