'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/domain/users';
import { fetchCurrentUser, loginUser, registerUser, type LoginPayload, type RegisterPayload } from '@/lib/api/auth';

const AUTH_STORAGE_KEY = 'broks.auth';

type PersistedAuth = {
  user: User;
  token: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (credentials: LoginPayload) => Promise<User>;
  signUp: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const saveAuthState = (payload: PersistedAuth | null) => {
  if (typeof window === 'undefined') return;
  if (!payload) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const readAuthState = (): PersistedAuth | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    saveAuthState(null);
  }, []);

  const applyAuth = useCallback((data: PersistedAuth) => {
    setUser(data.user);
    setToken(data.token);
    saveAuthState(data);
    return data.user;
  }, []);

  useEffect(() => {
    const persisted = readAuthState();
    if (!persisted?.token) {
      setLoading(false);
      return;
    }

    setToken(persisted.token);
    fetchCurrentUser(persisted.token)
      .then((response) => {
        applyAuth({ user: response.data, token: persisted.token });
      })
      .catch((error) => {
        console.warn('Failed to restore session', error);
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [applyAuth, logout]);

  const signIn = useCallback(
    async (credentials: LoginPayload) => {
      const response = await loginUser(credentials);
      return applyAuth(response.data);
    },
    [applyAuth],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const response = await registerUser(payload);
      return applyAuth(response.data);
    },
    [applyAuth],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      signIn,
      signUp,
      logout,
    }),
    [user, token, loading, signIn, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
