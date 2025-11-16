"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.currentUser = currentUser;
const zod_1 = require("zod");
const authService_1 = require("../services/authService");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(60),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(64),
    phone: zod_1.z.string().min(5).max(20).optional(),
    company: zod_1.z.string().max(80).optional(),
    role: zod_1.z.enum(['broker', 'buyer', 'admin']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
const formatValidationError = (error) => ({
    message: 'Некорректные данные',
    issues: error.flatten().fieldErrors,
});
async function register(request, response) {
    try {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json(formatValidationError(parsed.error));
        }
        const existing = await (0, authService_1.findUserByEmail)(parsed.data.email);
        if (existing) {
            return response.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован' });
        }
        const user = await (0, authService_1.createUserAccount)(parsed.data);
        const token = (0, authService_1.signAuthToken)(user._id.toString());
        return response.status(201).json({
            data: {
                user: (0, authService_1.toPublicUser)(user),
                token,
            },
        });
    }
    catch (error) {
        console.error('register error', error);
        return response.status(500).json({ message: 'Не удалось создать пользователя' });
    }
}
async function login(request, response) {
    try {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json(formatValidationError(parsed.error));
        }
        const user = await (0, authService_1.findUserByEmail)(parsed.data.email);
        if (!user) {
            return response.status(401).json({ message: 'Неверный email или пароль' });
        }
        const isValid = await (0, authService_1.comparePassword)(parsed.data.password, user.passwordHash);
        if (!isValid) {
            return response.status(401).json({ message: 'Неверный email или пароль' });
        }
        const token = (0, authService_1.signAuthToken)(user._id.toString());
        return response.json({
            data: {
                user: (0, authService_1.toPublicUser)(user),
                token,
            },
        });
    }
    catch (error) {
        console.error('login error', error);
        return response.status(500).json({ message: 'Не удалось выполнить вход' });
    }
}
async function currentUser(request, response) {
    try {
        if (!request.authUserId) {
            return response.status(401).json({ message: 'Требуется авторизация' });
        }
        const user = await (0, authService_1.findUserById)(request.authUserId);
        if (!user) {
            return response.status(404).json({ message: 'Пользователь не найден' });
        }
        return response.json({ data: (0, authService_1.toPublicUser)(user) });
    }
    catch (error) {
        console.error('currentUser error', error);
        return response.status(500).json({ message: 'Не удалось получить профиль' });
    }
}
