import React, { useEffect, useState } from 'react';
import { TestResult } from '../types';
import confetti from 'canvas-confetti';
import { sendTestReportToTelegram } from '../services/telegram';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Send,
  RefreshCw,
  Home,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface QuizResultPageProps {
  result: TestResult;
  onGoHome: () => void;
  onRetryLesson: () => void;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({
  result,
  onGoHome,
  onRetryLesson,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [isResending, setIsResending] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(result.telegramStatus);

  useEffect(() => {
    // Launch celebratory confetti if student did well (>= 70%)
    if (result.percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [result.percentage]);

  const handleResendTelegram = async () => {
    setIsResending(true);
    try {
      const res = await sendTestReportToTelegram(result);
      setTelegramStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResending(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  const filteredQuestions = result.questions.filter((q) => {
    const selected = result.answers[q.id];
    const isCorrect = selected === q.correctOptionIndex;
    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return !isCorrect;
    return true;
  });

  const formatTimeUzbek = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} soniya`;
    if (secs === 0) return `${mins} daqiqa`;
    return `${mins} daqiqa ${secs} soniya`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Result Overview Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {result.lessonTitle}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Test muvaffaqiyatli topshirildi!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            O'quvchi: <strong>{result.studentFullName}</strong>
          </p>

          {/* Primary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {result.percentage}%
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Umumiy foiz
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {result.correctCount} / {result.totalQuestions}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                To'g'ri javoblar
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                {formatTimeUzbek(result.timeSpentSeconds)}
              </span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Sarflangan vaqt</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                {new Date(result.completedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Topshirilgan vaqt</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Delivery Status Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Telegram Bot Xabarnomasi</span>
                {telegramStatus?.channelSent || telegramStatus?.adminSent ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Yetkazildi
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Yuborilmoqda / Tekshirilmoqda
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kanalga va o'qituvchiga to'liq natijalar yuborildi.
              </p>
            </div>
          </div>

          <button
            onClick={handleResendTelegram}
            disabled={isResending}
            className="py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Qaytadan yuborish</span>
          </button>
        </div>
      </div>

      {/* Detailed Question Review (Tahlil) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Savollar tahlili
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Har bir savol bo'yicha to'g'ri va siz belgilagan variantlar:
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Barchasi ({result.questions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'correct'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              To'g'ri ({result.correctCount})
            </button>
            <button
              onClick={() => setFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'incorrect'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Xato ({result.incorrectCount + result.skippedCount})
            </button>
          </div>
        </div>

        {/* Questions Breakdown List */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const selectedOpt = result.answers[q.id];
            const isCorrect = selectedOpt === q.correctOptionIndex;
            const isSkipped = selectedOpt === undefined || selectedOpt === null;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>To'g'ri javob</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>{isSkipped ? 'Javob berilmadi' : 'Xato javob'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  {q.text}
                </p>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isStudentChoice = selectedOpt === optIdx;
                    const isTheCorrectOne = q.correctOptionIndex === optIdx;

                    let cardClass =
                      'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                    if (isTheCorrectOne) {
                      cardClass =
                        'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isStudentChoice && !isTheCorrectOne) {
                      cardClass =
                        'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 ${cardClass}`}
                      >
                        <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {optionLabels[optIdx]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isTheCorrectOne && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            To'g'ri
                          </span>
                        )}
                        {isStudentChoice && !isTheCorrectOne && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
                            Sizning javobingiz
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation if present */}
                {q.explanation && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200">Tushuntirish:</strong>{' '}
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Actions */}
      <div className="sticky bottom-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3">
        <button
          onClick={onGoHome}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </button>

        <button
          onClick={onRetryLesson}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Qaytadan topshirish</span>
        </button>
      </div>
    </div>
  );
};

