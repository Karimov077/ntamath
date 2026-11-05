import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Question, TestResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { getRandomQuestions } from '../utils/shuffle';
import { saveResult } from '../services/storage';
import { sendTestReportToTelegram, triggerHaptic } from '../services/telegram';
import { Modal } from '../components/Modal';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Send,
  Flag,
} from 'lucide-react';

interface QuizPageProps {
  lesson: Lesson;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  lesson,
  onComplete,
  onCancel,
}) => {
  const { currentUser } = useAuth();

  // 1. Randomly sample 20 questions using Fisher-Yates shuffle
  const [questions] = useState<Question[]>(() => {
    return getRandomQuestions(lesson.questions, 20);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer setup: default 30 minutes in seconds
  const totalSeconds = (lesson.durationMinutes || 30) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const startTimeRef = useRef(Date.now());

  // Timer countdown effect
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Format timer MM:SS
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const unansweredCount = questions.length - answeredCount;

  // Handle option select
  const handleSelectOption = (optionIndex: number) => {
    triggerHaptic('impact');
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  // Toggle flag for question review
  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Calculate score
    let correctCount = 0;
    let skippedCount = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === null || selected === undefined) {
        skippedCount++;
      } else if (selected === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const incorrectCount = totalQuestions - correctCount - skippedCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const result: TestResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      studentId: currentUser?.id || 'anonymous',
      studentUsername: currentUser?.username || 'user',
      studentFullName: currentUser?.fullName || 'Noma\'lum O\'quvchi',
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      percentage,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      answers,
      questions,
    };

    // Save locally
    saveResult(result);

    // Send to Telegram Bot API (channel + admin)
    try {
      const tgStatus = await sendTestReportToTelegram(result);
      result.telegramStatus = tgStatus;
    } catch (e) {
      console.error('Failed to trigger telegram report dispatch:', e);
    }

    triggerHaptic('success');
    setIsSubmitting(false);
    setShowConfirmModal(false);
    onComplete(result);
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p className="text-red-500">Ushbu darsda savollar mavjud emas.</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm"
        >
          Ortga qaytish
        </button>
      </div>
    );
  }

  const isLowTime = secondsRemaining <= 120; // less than 2 minutes

  return (
    <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
      {/* Top Test Header & Timer Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            {lesson.number}-Dars
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">
            {lesson.title}
          </h2>
        </div>

        {/* Timer Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black transition ${
            isLowTime
              ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Question Navigator Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Savollar navigatori:
          </span>
          <span className="text-slate-500">
            {answeredCount} / {questions.length} yechildi
          </span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            const isFlag = !!flagged[q.id];

            let buttonClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

            if (isCurrent) {
              buttonClass = 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/40 font-bold';
            } else if (isFlag) {
              buttonClass = 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border-amber-400';
            } else if (isAnswered) {
              buttonClass = 'bg-emerald-500 text-white border-emerald-500';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-full aspect-square rounded-lg text-xs font-semibold border flex items-center justify-center transition active:scale-95 ${buttonClass}`}
                title={`Savol #${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
        {/* Question status header */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              {currentIndex + 1} / {questions.length}-savol
            </span>
            {answers[currentQuestion.id] !== undefined && (
              <span className="inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Belgilandi</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleFlag(currentQuestion.id)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
              flagged[currentQuestion.id]
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Qayta ko'rish uchun belgilash"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">
              {flagged[currentQuestion.id] ? 'Belgilandi' : 'Belgilash'}
            </span>
          </button>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.text}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, optIdx) => {
            const isSelected = answers[currentQuestion.id] === optIdx;

            return (
              <div
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {optionLabels[optIdx]}
                </div>
                <div className="text-sm font-medium leading-snug flex-1">{opt}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation controls */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Oldingi</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <span>Keyingi</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" />
              <span>Testni yakunlash</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Finish Test Trigger */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowConfirmModal(true)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline p-2"
        >
          Testni muddatidan oldin yakunlash →
        </button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Testni yakunlash"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {answeredCount}
                </span>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Javob berilgan
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {unansweredCount}
                </span>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                  Belgilanmagan
                </p>
              </div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Diqqat: Sizda <strong>{unansweredCount} ta</strong> belgilanmagan savol qoldi. Belgilanmagan savollar xato deb hisoblanadi.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Test yakunlangach, natijalaringiz hisoblanadi va Telegram bot orqali kanalga hamda adminga yuboriladi.
          </p>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition"
            >
              Savollarga qaytish
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tasdiqlayman</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

