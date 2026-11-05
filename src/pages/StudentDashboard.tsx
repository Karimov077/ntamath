import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, TestResult } from '../types';
import { getLessons, getResults } from '../services/storage';
import {
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
  History,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import { Modal } from '../components/Modal';

interface StudentDashboardProps {
  onStartLesson: (lesson: Lesson) => void;
  onViewResult: (result: TestResult) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartLesson,
  onViewResult,
}) => {
  const { currentUser } = useAuth();
  const lessons = getLessons();
  const allResults = getResults();

  // Filter results for current student
  const studentResults = allResults.filter(
    (r) => r.studentId === currentUser?.id || r.studentUsername === currentUser?.username
  );

  const [selectedLessonForStart, setSelectedLessonForStart] = useState<Lesson | null>(null);

  // Calculate statistics
  const totalTests = studentResults.length;
  const avgScore =
    totalTests > 0
      ? Math.round(studentResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalTests)
      : 0;
  const bestScore =
    totalTests > 0 ? Math.max(...studentResults.map((r) => r.percentage)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/15">
        {/* Background glow effects */}
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Matematika kursi • NTAMath</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Xush kelibsiz, {currentUser?.fullName}! 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Kerakli darsni tanlang va bilimlaringizni sinovdan o'tkazing. Har bir test natijasi avtomatik tarzda Telegram orqali o'qituvchiga yetkaziladi.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <span className="text-xl sm:text-2xl font-black">{totalTests}</span>
              <p className="text-[11px] text-indigo-100 font-medium">Topshirilgan testlar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <span className="text-xl sm:text-2xl font-black">{avgScore}%</span>
              <p className="text-[11px] text-indigo-100 font-medium">O'rtacha ko'rsatkich</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <span className="text-xl sm:text-2xl font-black">{bestScore}%</span>
              <p className="text-[11px] text-indigo-100 font-medium">Eng yuqori natija</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Lessons Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Mavjud darslar</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lessons.length} ta dars mavjud
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hozircha hech qanday dars qo'shilmagan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => {
              const questionCount = lesson.questions?.length || 0;
              const testCount = Math.min(20, questionCount);
              const userAttempts = studentResults.filter((r) => r.lessonId === lesson.id);
              const latestAttempt = userAttempts[0];

              return (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                        {lesson.number}-Dars
                      </span>
                      {latestAttempt && (
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          Oxirgi natija: {latestAttempt.percentage}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {lesson.description || 'Matematika kursi bo\'yicha nazariy va amaliy test savollari.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{lesson.durationMinutes || 30} daqiqa</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Tasodifiy {testCount} ta savol</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLessonForStart(lesson)}
                    disabled={questionCount === 0}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{questionCount === 0 ? 'Savollar yo\'q' : 'Testni boshlash'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Test History Section */}
      {studentResults.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Oldingi natijalarim</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
            {studentResults.slice(0, 5).map((res) => (
              <div
                key={res.id}
                onClick={() => onViewResult(res)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {res.lessonTitle}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{new Date(res.completedAt).toLocaleDateString('uz-UZ')}</span>
                    <span>•</span>
                    <span>
                      {res.correctCount} / {res.totalQuestions} ta to'g'ri
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                      res.percentage >= 80
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : res.percentage >= 60
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {res.percentage}%
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Test Confirmation Modal */}
      <Modal
        isOpen={!!selectedLessonForStart}
        onClose={() => setSelectedLessonForStart(null)}
        title="Testni boshlashga tayyormisiz?"
        maxWidth="md"
      >
        {selectedLessonForStart && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                {selectedLessonForStart.title}
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                {selectedLessonForStart.description}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Savollar bazasidan <strong>tasodifiy (Fisher-Yates) 20 ta</strong> savol tanlanadi.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Ajratilgan vaqt: <strong>{selectedLessonForStart.durationMinutes || 30} daqiqa</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Natijangiz avtomatik tarzda <strong>Telegram kanal</strong> va <strong>o'qituvchiga</strong> yuboriladi.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedLessonForStart(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  const lesson = selectedLessonForStart;
                  setSelectedLessonForStart(null);
                  onStartLesson(lesson);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

