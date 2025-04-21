import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserStore } from '../store/useStore';
import apiClient from '@/services/api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, setUser, logout: storeLogout } = useUserStore();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth-token');
    if (token) {
      validateSession();
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async () => {
    try {
      const response = await apiClient.get('/auth/validate');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('auth-token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('auth-token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    storeLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 