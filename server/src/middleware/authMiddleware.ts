import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../services/authService';
import { User } from '../models/User';
import type { UserRole } from '../types/users';

export interface AuthenticatedRequest extends Request {
  authUserId?: string;
  authUserRole?: UserRole;
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;
  if (!authorization) {
    return response.status(401).json({ message: 'Требуется авторизация' });
  }

  const [scheme, rawToken] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !rawToken) {
    return response.status(401).json({ message: 'Заголовок авторизации некорректен' });
  }

  const token = rawToken.trim();
  try {
    const payload = verifyAuthToken(token);
    request.authUserId = payload.sub;
    return next();
  } catch (error) {
    console.error('authMiddleware', error);
    return response.status(401).json({ message: 'Недействительный или истёкший токен' });
  }
}

export async function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  if (!request.authUserId) {
    return response.status(401).json({ message: 'Требуется авторизация' });
  }

  const user = await User.findById(request.authUserId).select('role');
  if (!user || user.role !== 'admin') {
    return response.status(403).json({ message: 'Недостаточно прав' });
  }

  request.authUserRole = user.role;
  next();
}
