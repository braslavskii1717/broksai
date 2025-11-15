"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const connect_1 = require("../lib/connect");
const Property_1 = require("../models/Property");
const generateProperties_1 = require("./generateProperties");
dotenv_1.default.config();
async function seedDatabase() {
    try {
        await (0, connect_1.connectDB)();
        console.log('🌱 Начинаем заполнение БД...');
        await Property_1.Property.deleteMany({});
        const data = (0, generateProperties_1.generateProperties)(100);
        await Property_1.Property.insertMany(data);
        console.log(`✅ Добавлено ${data.length} объектов`);
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Ошибка при заполнении БД', error);
        process.exit(1);
    }
}
seedDatabase();
