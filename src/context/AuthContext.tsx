import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Lease } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  activeLease: Lease | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserDirectly: (user: User, token: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('rentpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error, info } = useToast();

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('rentpulse_token');
    if (!storedToken) {
      setUser(null);
      setActiveLease(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      if (data.lease) {
        setActiveLease(data.lease);
      }
    } catch (err: any) {
      console.warn('Auto auth session check failed:', err.message);
      localStorage.removeItem('rentpulse_token');
      setUser(null);
      setActiveLease(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('rentpulse_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success('Logged In Successfully', `Welcome back, ${data.user.name}`);
      await refreshUser();
    } catch (err: any) {
      error('Login Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rentpulse_token');
    setToken(null);
    setUser(null);
    setActiveLease(null);
    info('Logged Out', 'You have been safely signed out.');
  };

  const setUserDirectly = (newUser: User, newToken: string) => {
    localStorage.setItem('rentpulse_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeLease,
        token,
        isLoading,
        login,
        logout,
        setUserDirectly,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
