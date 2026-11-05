import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudents } from '../services/storage';
import { Lock, User, KeyRound, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const students = getStudents();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Iltimos, login va parolni to\'liq kiriting!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.message || 'Kirishda xatolik yuz berdi!');
      }
    }, 250);
  };

  const handleSelectAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setShowAccountsModal(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <KeyRound className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tizimga kirish
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              NTAMath test platformasiga xush kelibsiz!
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Foydalanuvchi nomi (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="masalan: jaxongir_a yoki admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  autoCapitalize="none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Dastlabki parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Kirish</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick accounts help */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setShowAccountsModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tayyor o'quvchilar va Admin parollari ro'yxati</span>
            </button>
          </div>
        </div>

        {/* Telegram WebApp indicator */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Telegram Mini App uchun optimallashtirilgan v1.0
        </p>
      </div>

      {/* Pre-configured Accounts Modal for Fast Testing */}
      <Modal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
        title="Dastlabki Login va Parollar"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Istalgan o'quvchi yoki administrator hisobini tanlang, formaga avtomatik joylanadi:
          </p>

          {/* Admin card */}
          <div
            onClick={() => handleSelectAccount('admin', 'SuperAdminTest2026!')}
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-white">
                  ADMIN
                </span>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Bosh Administrator
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-mono">
                admin / SuperAdminTest2026!
              </p>
            </div>
            <button className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-white/70 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700">
              Tanlash
            </button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              O'quvchilar (20 nafar)
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {students
                .filter((s) => s.role === 'student')
                .map((student, idx) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectAccount(student.username, student.password || '')}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {student.fullName}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {student.username} • {student.password}
                      </div>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Tanlash</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

