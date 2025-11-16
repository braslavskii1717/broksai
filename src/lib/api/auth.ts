import type { User, UserRole } from '@/domain/users';
import { API_BASE } from './client';

type AuthSuccessResponse = {
  data: {
    user: User;
    token: string;
  };
};

type ProfileResponse = {
  data: User;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

async function request<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  let data: unknown;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : (data as any)?.message ?? 'Не удалось выполнить запрос';
    throw new Error(message);
  }

  return (data ?? {}) as TResponse;
}

export async function registerUser(payload: RegisterPayload) {
  return request<AuthSuccessResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload) {
  return request<AuthSuccessResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(token: string) {
  return request<ProfileResponse>('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
