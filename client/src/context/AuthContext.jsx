import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'shopsphere_user';
const TOKEN_KEY = 'shopsphere_token';

function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback((data) => {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const data = await authService.register(formData);
        persistSession(data);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const login = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        const data = await authService.login(formData);
        persistSession(data);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await authService.getProfile();
    setUser(data.user);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { api };
