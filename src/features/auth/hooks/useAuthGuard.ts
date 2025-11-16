'use client';

import { useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

type UnauthorizedHandler = () => void;

type AnyFunc<T extends any[]> = (...args: T) => void;

export function useAuthGuard() {
  const { user, loading } = useAuth();

  const requireAuth = useCallback(
    <T extends any[]>(action: AnyFunc<T>, onUnauthorized?: UnauthorizedHandler) => {
      return (...args: T) => {
        if (loading) return;
        if (!user) {
          onUnauthorized?.();
          return;
        }
        action(...args);
      };
    },
    [user, loading],
  );

  return { requireAuth, isAuthenticated: Boolean(user) };
}
