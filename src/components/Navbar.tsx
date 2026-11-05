import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, GraduationCap, ChevronLeft, Send } from 'lucide-react';

interface NavbarProps {
  currentView: 'login' | 'dashboard' | 'quiz' | 'result' | 'admin';
  onNavigate: (view: 'login' | 'dashboard' | 'quiz' | 'result' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { currentUser, logout, theme, toggleTheme, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          {currentView !== 'dashboard' && currentView !== 'login' && currentView !== 'quiz' && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Orqaga qaytish"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => currentUser && onNavigate(isAdmin ? 'admin' : 'dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black tracking-wider text-sm">
              NTA
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                NTAMath
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400">
                  WebApp
                </span>
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Telegram Test Platformasi
              </p>
            </div>
          </div>
        </div>

        {/* User status & actions */}
        <div className="flex items-center gap-2">
          {currentUser && (
            <>
              {/* Role badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                {isAdmin ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium">Administrator</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-medium truncate max-w-[120px]">{currentUser.fullName}</span>
                  </>
                )}
              </div>

              {/* Quick Admin Switch */}
              {isAdmin && currentView !== 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              {isAdmin && currentView === 'admin' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-1"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">O'quvchi ko'rinishi</span>
                </button>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Logout */}
          {currentUser && (
            <button
              onClick={() => {
                logout();
                onNavigate('login');
              }}
              aria-label="Chiqish"
              title="Tizimdan chiqish"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

