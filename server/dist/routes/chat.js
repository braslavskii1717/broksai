"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
const conversationStore = new Map();
const MAX_HISTORY_MESSAGES = 10;
router.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body ?? {};
        if (typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }
        if (trimmedMessage.length > 500) {
            return res.status(400).json({ error: 'Message too long (max 500 characters)' });
        }
        const sessionId = typeof conversationId === 'string' && conversationId.length > 0 ? conversationId : 'default';
        const history = conversationStore.get(sessionId) ?? [];
        console.log(`💬 Chat request [${sessionId}]: "${trimmedMessage.slice(0, 60)}${trimmedMessage.length > 60 ? '…' : ''}"`);
        const aiResponse = await (0, aiService_1.generateAIResponse)(trimmedMessage, history);
        const newHistory = [
            ...history,
            { role: 'user', content: trimmedMessage },
            { role: 'assistant', content: aiResponse },
        ].slice(-MAX_HISTORY_MESSAGES);
        conversationStore.set(sessionId, newHistory);
        const payload = {
            response: aiResponse,
            timestamp: new Date().toISOString(),
            conversationId: sessionId,
        };
        res.json(payload);
        console.log(`✅ Chat response sent (${aiResponse.length} chars) for session ${sessionId}`);
    }
    catch (error) {
        console.error('❌ Chat API Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('Invalid OpenAI API key')) {
            return res.status(500).json({
                error: 'AI service configuration error',
                message: 'Пожалуйста, свяжитесь с брокером напрямую',
            });
        }
        if (message.includes('quota exceeded') || message.includes('OpenAI quota exceeded')) {
            return res.status(503).json({
                error: 'AI service temporarily unavailable',
                message: 'Сервис временно недоступен. Попробуйте позже или свяжитесь с брокером',
            });
        }
        return res.status(500).json({
            error: 'Failed to process message',
            message: 'Не удалось получить ответ. Попробуйте ещё раз или свяжитесь с брокером',
        });
    }
});
router.get('/api/chat/health', (_req, res) => {
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
    res.json({
        status: hasApiKey ? 'ok' : 'no_api_key',
        service: 'chat',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
