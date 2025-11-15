"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const router = (0, express_1.Router)();
router.get('/', propertyController_1.listProperties);
router.get('/:id', propertyController_1.getProperty);
router.post('/', propertyController_1.createProperty);
exports.default = router;
