import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStudents } from '../services/storage';
import { initTelegramWebApp } from '../services/telegram';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  isAdmin: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ntamath_auth_user';
const THEME_KEY = 'ntamath_theme_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.Telegram?.WebApp?.colorScheme) {
        return window.Telegram.WebApp.colorScheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    initTelegramWebApp();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check special admin credentials from requirement 3:
    // username: `admin` / password: `SuperAdminTest2026!`
    if (cleanUsername === 'admin' && cleanPassword === 'SuperAdminTest2026!') {
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        fullName: 'Bosh Administrator',
        role: 'admin',
      };
      setCurrentUser(adminUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // Check students list
    const students = getStudents();
    const found = students.find(
      (s) => s.username.toLowerCase() === cleanUsername && s.password === cleanPassword
    );

    if (found) {
      const sessionUser: User = {
        id: found.id,
        username: found.username,
        fullName: found.fullName,
        role: found.role,
      };
      setCurrentUser(sessionUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
      return { success: true };
    }

    return {
      success: false,
      message: 'Login yoki parol noto\'g\'ri! Iltimos, qaytadan tekshirib kiritib ko\'ring.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAdmin: currentUser?.role === 'admin',
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

