import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  comparePassword,
  createUserAccount,
  findUserByEmail,
  findUserById,
  signAuthToken,
  toPublicUser,
} from '../services/authService';

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(64),
  phone: z.string().min(5).max(20).optional(),
  company: z.string().max(80).optional(),
  role: z.enum(['broker', 'buyer', 'admin']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const formatValidationError = (error: z.ZodError) => ({
  message: 'Некорректные данные',
  issues: error.flatten().fieldErrors,
});

export async function register(request: Request, response: Response) {
  try {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json(formatValidationError(parsed.error));
    }

    const existing = await findUserByEmail(parsed.data.email);
    if (existing) {
      return response.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован' });
    }

    const user = await createUserAccount(parsed.data);
    const token = signAuthToken(user._id.toString());

    return response.status(201).json({
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (error) {
    console.error('register error', error);
    return response.status(500).json({ message: 'Не удалось создать пользователя' });
  }
}

export async function login(request: Request, response: Response) {
  try {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json(formatValidationError(parsed.error));
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return response.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isValid = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return response.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = signAuthToken(user._id.toString());

    return response.json({
      data: {
        user: toPublicUser(user),
        token,
      },
    });
  } catch (error) {
    console.error('login error', error);
    return response.status(500).json({ message: 'Не удалось выполнить вход' });
  }
}

export async function currentUser(request: AuthenticatedRequest, response: Response) {
  try {
    if (!request.authUserId) {
      return response.status(401).json({ message: 'Требуется авторизация' });
    }
    const user = await findUserById(request.authUserId);
    if (!user) {
      return response.status(404).json({ message: 'Пользователь не найден' });
    }
    return response.json({ data: toPublicUser(user) });
  } catch (error) {
    console.error('currentUser error', error);
    return response.status(500).json({ message: 'Не удалось получить профиль' });
  }
}
