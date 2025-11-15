"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cities_1 = require("../constants/cities");
const router = (0, express_1.Router)();
router.get('/', (_, res) => {
    res.json({ data: cities_1.russianCities });
});
exports.default = router;
