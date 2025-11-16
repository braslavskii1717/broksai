"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIResponse = generateAIResponse;
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const SYSTEM_PROMPT = `Ты — профессиональный консультант по недвижимости для сервиса BROKS.
Твоя задача — помогать клиентам подобрать подходящую недвижимость в Москве и Санкт-Петербурге.

Доступные объекты:
- Москва: квартиры от 9 до 55 млн руб, площадью от 32 до 210 м²
- Санкт-Петербург: квартиры и дома от 9 до 42 млн руб, площадью от 41 до 190 м²

Твои правила:
1. Отвечай кратко и по делу (максимум 3-4 предложения)
2. Задавай уточняющие вопросы о бюджете, площади, районе
3. Рекомендуй конкретные районы и типы жилья
4. Будь вежливым и профессиональным
5. Не придумывай данные — используй только реальные диапазоны цен и характеристик из списка`;
async function generateAIResponse(userMessage, conversationHistory = []) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('Invalid OpenAI API key');
    }
    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: userMessage },
        ];
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            max_tokens: 250,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }
        return response.trim();
    }
    catch (error) {
        console.error('❌ OpenAI API Error:', error);
        if (typeof error === 'object' && error && 'code' in error) {
            const err = error;
            if (err.code === 'invalid_api_key') {
                throw new Error('Invalid OpenAI API key');
            }
            if (err.code === 'insufficient_quota') {
                throw new Error('OpenAI quota exceeded');
            }
        }
        const message = error instanceof Error ? error.message : 'Unknown AI error';
        throw new Error(`AI service error: ${message}`);
    }
}
