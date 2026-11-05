import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Lesson, TestResult } from './types';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { QuizPage } from './pages/QuizPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard';
import { getLessonById } from './services/storage';

export const App: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'quiz' | 'result' | 'admin'>('login');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  // Sync view when auth changes
  useEffect(() => {
    if (!currentUser) {
      setCurrentView('login');
      setActiveLesson(null);
    } else {
      if (isAdmin && currentView === 'login') {
        setCurrentView('admin');
      } else if (currentView === 'login') {
        setCurrentView('dashboard');
      }
    }
  }, [currentUser, isAdmin]);

  // Handle Telegram WebApp native BackButton
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const backButton = tg.BackButton;
    if (!backButton) return;

    const handleBackClick = () => {
      if (currentView === 'quiz') {
        if (confirm('Testni to\'xtatmoqchimisiz? Natijalar saqlanmaydi.')) {
          setCurrentView('dashboard');
          setActiveLesson(null);
        }
      } else if (currentView === 'result' || currentView === 'admin') {
        setCurrentView('dashboard');
      }
    };

    if (currentView !== 'dashboard' && currentView !== 'login') {
      backButton.show();
      backButton.onClick(handleBackClick);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.offClick(handleBackClick);
    };
  }, [currentView]);

  // Navigation callbacks
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (result: TestResult) => {
    setLastResult(result);
    setCurrentView('result');
  };

  const handleViewResult = (result: TestResult) => {
    setLastResult(result);
    setCurrentView('result');
  };

  const handleRetryLesson = () => {
    if (lastResult) {
      const lesson = getLessonById(lastResult.lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        setCurrentView('quiz');
        return;
      }
    }
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar currentView={currentView} onNavigate={(view) => setCurrentView(view)} />

      <main className="flex-1 pb-12">
        {currentView === 'login' && (
          <LoginPage onLoginSuccess={() => setCurrentView(isAdmin ? 'admin' : 'dashboard')} />
        )}

        {currentView === 'dashboard' && currentUser && (
          <StudentDashboard
            onStartLesson={handleStartLesson}
            onViewResult={handleViewResult}
          />
        )}

        {currentView === 'quiz' && activeLesson && (
          <QuizPage
            lesson={activeLesson}
            onComplete={handleQuizComplete}
            onCancel={() => {
              setActiveLesson(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'result' && lastResult && (
          <QuizResultPage
            result={lastResult}
            onGoHome={() => setCurrentView('dashboard')}
            onRetryLesson={handleRetryLesson}
          />
        )}

        {currentView === 'admin' && isAdmin && <AdminDashboard />}
      </main>
    </div>
  );
};

