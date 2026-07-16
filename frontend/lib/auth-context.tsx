'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager } from './api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = tokenManager.getToken();
        if (token) {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    tokenManager.setToken(response.access_token);
    const userData = await authAPI.getCurrentUser();
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    await authAPI.register({ name, email, password });
    await login(email, password);
  };

  const logout = () => {
    tokenManager.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
