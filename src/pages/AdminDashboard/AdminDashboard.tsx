import React, { useState } from 'react';
import { Lesson, Question, TestResult, User } from '../../types';
import {
  getLessons,
  saveLessons,
  saveOrUpdateLesson,
  deleteLesson,
  addQuestionToLesson,
  updateQuestionInLesson,
  deleteQuestionFromLesson,
  bulkAddQuestionsToLesson,
  getStudents,
  saveOrUpdateStudent,
  getResults,
  triggerDownloadBackup,
  importDataFromJson,
  resetAllToDefaults,
} from '../../services/storage';
import {
  getTelegramConfig,
  saveTelegramConfig,
} from '../../services/telegram';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  pushDataToSupabase,
  pullDataFromSupabase,
} from '../../services/supabase';
import { QuestionFormModal } from './QuestionFormModal';
import { BulkImportModal } from './BulkImportModal';
import { Modal } from '../../components/Modal';
import {
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  RefreshCw,
  Send,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'students' | 'results' | 'settings'>('lessons');

  // Lessons State
  const [lessons, setLessons] = useState<Lesson[]>(() => getLessons());
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => lessons[0]?.id || '');
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(30);

  // Questions Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');

  // Students State
  const [students, setStudents] = useState<User[]>(() => getStudents());
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // Results State
  const [results, setResults] = useState<TestResult[]>(() => getResults());
  const [resultsFilterLesson, setResultsFilterLesson] = useState<string>('all');
  const [resultsFilterStudent, setResultsFilterStudent] = useState<string>('all');

  // Telegram Config State
  const [tgConfig, setTgConfig] = useState(getTelegramConfig());
  const [tgStatusMsg, setTgStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isTestingTg, setIsTestingTg] = useState(false);

  // Supabase State
  const [sbConfig, setSbConfig] = useState(getSupabaseConfig());
  const [sbStatusMsg, setSbStatusMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [isSyncingSb, setIsSyncingSb] = useState(false);

  const activeLesson = lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  // =================== LESSON ACTIONS ===================

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      number: lessons.length + 1,
      title: newLessonTitle.trim(),
      description: newLessonDesc.trim(),
      durationMinutes: Number(newLessonDuration) || 30,
      questions: [],
      createdAt: new Date().toISOString(),
    };

    const updated = saveOrUpdateLesson(newLesson);
    setLessons(updated);
    setSelectedLessonId(newLesson.id);
    setIsNewLessonModalOpen(false);
    setNewLessonTitle('');
    setNewLessonDesc('');
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm('Ushbu dars va unga tegishli barcha savollarni o\'chirmoqchimisiz?')) {
      const updated = deleteLesson(id);
      setLessons(updated);
      if (selectedLessonId === id) {
        setSelectedLessonId(updated[0]?.id || '');
      }
    }
  };

  // =================== QUESTION ACTIONS ===================

  const handleSaveQuestion = (question: Question) => {
    if (!activeLesson) return;
    let updatedLesson: Lesson | null = null;
    if (editingQuestion) {
      updatedLesson = updateQuestionInLesson(activeLesson.id, question);
    } else {
      updatedLesson = addQuestionToLesson(activeLesson.id, question);
    }
    if (updatedLesson) {
      setLessons(getLessons());
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!activeLesson) return;
    if (confirm('Savolni o\'chirmoqchimisiz?')) {
      deleteQuestionFromLesson(activeLesson.id, qId);
      setLessons(getLessons());
    }
  };

  const handleBulkImport = (newQuestions: Question[]) => {
    if (!activeLesson) return;
    bulkAddQuestionsToLesson(activeLesson.id, newQuestions);
    setLessons(getLessons());
  };

  // =================== STUDENT ACTIONS ===================

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentUsername.trim() || !newStudentPassword.trim()) return;

    const newStudent: User = {
      id: `std-${Date.now()}`,
      username: newStudentUsername.trim().toLowerCase(),
      password: newStudentPassword.trim(),
      fullName: newStudentName.trim(),
      role: 'student',
    };

    const updated = saveOrUpdateStudent(newStudent);
    setStudents(updated);
    setIsStudentModalOpen(false);
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('');
  };

  // =================== TELEGRAM TEST ===================

  const handleSaveTgConfig = () => {
    saveTelegramConfig(tgConfig);
    setTgStatusMsg({ text: 'Telegram sozlamalari saqlandi!', success: true });
    setTimeout(() => setTgStatusMsg(null), 3500);
  };

  const handleSendTestTgMessage = async () => {
    if (!tgConfig.botToken) {
      setTgStatusMsg({ text: 'Bot Token kiritilmagan!', success: false });
      return;
    }
    setIsTestingTg(true);
    setTgStatusMsg(null);

    const testUrl = `https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`;
    const text = `🔔 <b>NTAMath Test Platformasi</b>\n\nTelegram Bot va Kanal integratsiyasi muvaffaqiyatli sinovdan o'tdi! ✅\nSana: ${new Date().toLocaleString('uz-UZ')}`;

    try {
      let sentCount = 0;
      let errDetails = '';

      if (tgConfig.channelId) {
        const r1 = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgConfig.channelId, text, parse_mode: 'HTML' }),
        });
        const d1 = await r1.json();
        if (d1.ok) sentCount++;
        else errDetails += `Kanal: ${d1.description}; `;
      }

      if (tgConfig.adminId) {
        const r2 = await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgConfig.adminId, text, parse_mode: 'HTML' }),
        });
        const d2 = await r2.json();
        if (d2.ok) sentCount++;
        else errDetails += `Admin: ${d2.description}; `;
      }

      if (sentCount > 0) {
        setTgStatusMsg({
          text: `Sinov xabari muvaffaqiyatli yuborildi! (${sentCount} ta chatga)`,
          success: true,
        });
      } else {
        setTgStatusMsg({
          text: `Xatolik yuz berdi: ${errDetails || 'Xabar bormadi'}`,
          success: false,
        });
      }
    } catch (err: any) {
      setTgStatusMsg({ text: `Tarmoq xatosi: ${err.message}`, success: false });
    } finally {
      setIsTestingTg(false);
    }
  };

  // =================== SUPABASE ACTIONS ===================

  const handleSaveSbConfig = () => {
    saveSupabaseConfig(sbConfig);
    setSbStatusMsg({ text: 'Supabase sozlamalari saqlandi!', success: true });
    setTimeout(() => setSbStatusMsg(null), 3500);
  };

  const handlePushToSupabase = async () => {
    setIsSyncingSb(true);
    setSbStatusMsg(null);
    const res = await pushDataToSupabase();
    setSbStatusMsg({ text: res.message, success: res.success });
    setIsSyncingSb(false);
  };

  const handlePullFromSupabase = async () => {
    setIsSyncingSb(true);
    setSbStatusMsg(null);
    const res = await pullDataFromSupabase();
    if (res.success) {
      setLessons(getLessons());
      setStudents(getStudents());
      setResults(getResults());
    }
    setSbStatusMsg({ text: res.message, success: res.success });
    setIsSyncingSb(false);
  };

  // =================== BACKUP FILE IMPORT ===================

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJson(content);
      if (res.success) {
        setLessons(getLessons());
        setStudents(getStudents());
        setResults(getResults());
        alert(res.message);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Filter questions for active lesson
  const filteredQuestions = activeLesson?.questions.filter((q) =>
    q.text.toLowerCase().includes(questionSearch.toLowerCase())
  ) || [];

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filter results
  const filteredResults = results.filter((r) => {
    const matchLesson = resultsFilterLesson === 'all' || r.lessonId === resultsFilterLesson;
    const matchStudent = resultsFilterStudent === 'all' || r.studentId === resultsFilterStudent;
    return matchLesson && matchStudent;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Admin Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Boshqaruv Paneli
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            NTAMath Administrator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Darslar, test savollari, o'quvchilar va Telegram xabarnomalarini boshqarish
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'lessons'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Darslar & Testlar</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'students'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>O'quvchilar</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'results'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistika</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Sozlamalar</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: LESSONS & QUESTIONS ===================== */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Lessons Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Darslar ro'yxati
                </h3>
                <button
                  onClick={() => setIsNewLessonModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dars qo'shish</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {lessons.map((lesson) => {
                  const isSelected = lesson.id === activeLesson?.id;
                  const qCount = lesson.questions?.length || 0;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {lesson.number}-Dars
                        </span>
                        <h4 className="font-bold text-xs truncate mt-1">{lesson.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{qCount} ta savol</span>
                          <span>•</span>
                          <span>{lesson.durationMinutes || 30} daqiqa</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                        title="Darsni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Questions in Active Lesson */}
          <div className="lg:col-span-8 space-y-4">
            {activeLesson ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                {/* Active Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {activeLesson.number}-Dars tahriri
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Jami savollar: <strong>{activeLesson.questions.length} / 100 ta</strong> (Testda tasodifiy 20 tasi tushadi)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsBulkModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Bulk Import</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingQuestion(null);
                        setIsQuestionModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Savol qo'shish</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                    placeholder="Savollar ichidan qidirish..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Bu darsda hali savollar yo'q. "Savol qo'shish" yoki "Bulk Import" orqali yuklang.
                      </p>
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              #{idx + 1}
                            </span>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                              {q.text}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingQuestion(q);
                                setIsQuestionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                              title="Tahrirlash"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options preview */}
                        <div className="grid grid-cols-2 gap-1.5 mt-3 text-xs">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg border text-xs truncate flex items-center gap-1.5 ${
                                optIdx === q.correctOptionIndex
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                                {['A', 'B', 'C', 'D'][optIdx]}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500">Iltimos, chap tomondan darsni tanlang.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: STUDENTS ===================== */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                O'quvchilar ro'yxati ({students.filter((s) => s.role === 'student').length} nafar)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Oldindan kiritilgan 20 ta o'quvchi hisoblari va parollari
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yangi o'quvchi</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="O'quvchi ismi yoki login bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">O'quvchi F.I.</th>
                  <th className="px-4 py-3">Login (Username)</th>
                  <th className="px-4 py-3">Dastlabki Parol</th>
                  <th className="px-4 py-3 text-center">Topshirilgan testlar</th>
                  <th className="px-4 py-3 text-center">O'rtacha natija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents
                  .filter((s) => s.role === 'student')
                  .map((std, idx) => {
                    const studentAttempts = results.filter(
                      (r) => r.studentId === std.id || r.studentUsername === std.username
                    );
                    const avg =
                      studentAttempts.length > 0
                        ? Math.round(
                            studentAttempts.reduce((a, b) => a + b.percentage, 0) /
                              studentAttempts.length
                          )
                        : null;

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {std.fullName}
                        </td>
                        <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                          {std.username}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                          <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {std.password}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {studentAttempts.length} ta
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {avg !== null ? (
                            <span
                              className={`px-2 py-0.5 rounded ${
                                avg >= 80
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {avg}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: RESULTS STATS ===================== */}
      {activeTab === 'results' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Test natijalari jurnali ({results.length} ta natija)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O'quvchilar topshirgan barcha testlar statistikasi
              </p>
            </div>

            {/* Filter selectors */}
            <div className="flex items-center gap-2">
              <select
                value={resultsFilterLesson}
                onChange={(e) => setResultsFilterLesson(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Barcha darslar</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">O'quvchi</th>
                  <th className="px-4 py-3">Dars</th>
                  <th className="px-4 py-3 text-center">To'g'ri / Jami</th>
                  <th className="px-4 py-3 text-center">Foiz</th>
                  <th className="px-4 py-3 text-center">Sarflangan vaqt</th>
                  <th className="px-4 py-3">Sana va soat</th>
                  <th className="px-4 py-3 text-center">Telegram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Hech qanday natija topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {r.studentFullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          @{r.studentUsername}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {r.lessonTitle}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {r.correctCount} / {r.totalQuestions}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-black ${
                            r.percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.percentage >= 60
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">
                        {Math.floor(r.timeSpentSeconds / 60)} daq {r.timeSpentSeconds % 60} son
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(r.completedAt).toLocaleString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs" title="Telegram holati">
                          ✅ Yuborilgan
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: SETTINGS & BACKUP ===================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Telegram Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Telegram Bot va Kanal Sozlamalari
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Natijalar to'g'ridan-to'g'ri yuboriladigan bot va kanallar
                </p>
              </div>
            </div>

            {tgStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  tgStatusMsg.success
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {tgStatusMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{tgStatusMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={tgConfig.botToken}
                  onChange={(e) => setTgConfig({ ...tgConfig, botToken: e.target.value })}
                  placeholder="9165520607:AAHc..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram Kanal ID
                </label>
                <input
                  type="text"
                  value={tgConfig.channelId}
                  onChange={(e) => setTgConfig({ ...tgConfig, channelId: e.target.value })}
                  placeholder="-1004429502898"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Telegram ID
                </label>
                <input
                  type="text"
                  value={tgConfig.adminId}
                  onChange={(e) => setTgConfig({ ...tgConfig, adminId: e.target.value })}
                  placeholder="1840817356"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveTgConfig}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                Sozlamalarni saqlash
              </button>
              <button
                onClick={handleSendTestTgMessage}
                disabled={isTestingTg}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>{isTestingTg ? 'Yuborilmoqda...' : 'Sinov xabarini yuborish'}</span>
              </button>
            </div>
          </div>

          {/* Backup & Export / Import */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Zaxira nusxa (Backup) va Ma'lumotlarni saqlash
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bazasiz ishlaganda barcha darslar, savollar va natijalarni JSON fayl ko'rinishida saqlab oling
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={triggerDownloadBackup}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left flex flex-col justify-between"
              >
                <div>
                  <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Zaxira nusxani yuklab olish
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Barcha testlar va natijalarni .JSON fayl ko'rinishida saqlaydi
                  </p>
                </div>
                <span className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Eksport qilish →
                </span>
              </button>

              <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left flex flex-col justify-between cursor-pointer">
                <div>
                  <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Fayldan tiklash (Import)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Avval saqlab olingan .JSON zaxira faylini yuklash
                  </p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <span className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Faylni tanlash →
                </span>
              </label>

              <button
                onClick={() => {
                  if (confirm('Barcha darslar va o\'quvchilarni boshlang\'ich holatga qaytarmoqchimisiz?')) {
                    resetAllToDefaults();
                    setLessons(getLessons());
                    setStudents(getStudents());
                    setResults([]);
                    alert('Tizim boshlang\'ich holatga qaytarildi!');
                  }
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition text-left flex flex-col justify-between"
              >
                <div>
                  <RefreshCw className="w-5 h-5 text-red-500 mb-2" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Boshlang'ich holatga qaytarish
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Namunaviy 20 ta o'quvchi va darslarni qayta tiklash
                  </p>
                </div>
                <span className="mt-3 text-xs font-bold text-red-500">
                  Qayta o'rnatish →
                </span>
              </button>
            </div>
          </div>

          {/* Supabase Cloud Sync */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Supabase Bulut Bazasi Integratsiyasi (Ixtiyoriy)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supabase loyihangiz ma'lumotlarini ulab, testlar bazasini doimiy bulutda sinxronlang
                </p>
              </div>
            </div>

            {sbStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  sbStatusMsg.success
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {sbStatusMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{sbStatusMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={sbConfig.url}
                  onChange={(e) => setSbConfig({ ...sbConfig, url: e.target.value })}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={sbConfig.anonKey}
                  onChange={(e) => setSbConfig({ ...sbConfig, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleSaveSbConfig}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Kalitlarni saqlash
              </button>
              <button
                onClick={handlePushToSupabase}
                disabled={isSyncingSb}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSyncingSb ? 'Yuklanmoqda...' : 'Bulutga yuklash (Push)'}</span>
              </button>
              <button
                onClick={handlePullFromSupabase}
                disabled={isSyncingSb}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Bulutdan yuklab olish (Pull)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* New Lesson Modal */}
      <Modal
        isOpen={isNewLessonModalOpen}
        onClose={() => setIsNewLessonModalOpen(false)}
        title="Yangi dars yaratish"
        maxWidth="md"
      >
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dars nomi
            </label>
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="masalan: 3-Dars: Funksiyalar va formulalar"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Qisqa tavsif
            </label>
            <textarea
              value={newLessonDesc}
              onChange={(e) => setNewLessonDesc(e.target.value)}
              rows={2}
              placeholder="Dars mavzulari haqida qisqacha..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Test vaqti (daqiqa)
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={newLessonDuration}
              onChange={(e) => setNewLessonDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewLessonModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              Yaratish
            </button>
          </div>
        </form>
      </Modal>

      {/* New Student Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Yangi o'quvchi qo'shish"
        maxWidth="md"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              O'quvchi F.I.
            </label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="masalan: Alisher Navoiy"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Login (Username)
            </label>
            <input
              type="text"
              value={newStudentUsername}
              onChange={(e) => setNewStudentUsername(e.target.value)}
              placeholder="masalan: alisher_n"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dastlabki parol
            </label>
            <input
              type="text"
              value={newStudentPassword}
              onChange={(e) => setNewStudentPassword(e.target.value)}
              placeholder="masalan: Alis#2026"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              Qo'shish
            </button>
          </div>
        </form>
      </Modal>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
};

