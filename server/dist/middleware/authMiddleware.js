"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const authService_1 = require("../services/authService");
function requireAuth(request, response, next) {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return response.status(401).json({ message: 'Требуется авторизация' });
    }
    const token = authorization.replace('Bearer', '').trim();
    try {
        const payload = (0, authService_1.verifyAuthToken)(token);
        request.authUserId = payload.sub;
        return next();
    }
    catch (error) {
        console.error('authMiddleware', error);
        return response.status(401).json({ message: 'Недействительный или истёкший токен' });
    }
}
