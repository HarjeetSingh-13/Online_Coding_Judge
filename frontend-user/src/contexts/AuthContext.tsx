import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '../types';
import { api } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (): Promise<boolean> => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error fetching user:', error);
      Cookies.remove('token');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await api.login(email, password);
      return await fetchUser();
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await api.register(name, email, password);
      return await fetchUser(); 
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout failed:', err);
    }
    Cookies.remove('token');
    setUser(null);
    window.location.reload();
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response) {
        setUser(prev => prev ? { ...prev, password: newPassword } : null);  
        return true;
      } else {
        throw new Error('Current password is incorrect');
      }
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
