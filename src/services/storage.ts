import { Lesson, Question, TestResult, User } from '../types';
import initialStudents from '../data/students.json';
import initialLessons from '../data/tests.json';

const STORAGE_KEYS = {
  LESSONS: 'ntamath_lessons_v1',
  STUDENTS: 'ntamath_students_v1',
  RESULTS: 'ntamath_results_v1',
  ACTIVE_SESSION: 'ntamath_active_session',
  CURRENT_USER: 'ntamath_current_user',
  THEME: 'ntamath_theme',
};

// =================== LESSONS & TESTS ===================

export function getLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading lessons from localStorage:', e);
  }
  // Fallback to initial seed data
  const seeded = initialLessons as Lesson[];
  saveLessons(seeded);
  return seeded;
}

export function saveLessons(lessons: Lesson[]): void {
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
}

export function getLessonById(id: string): Lesson | undefined {
  const lessons = getLessons();
  return lessons.find((l) => l.id === id);
}

export function saveOrUpdateLesson(lesson: Lesson): Lesson[] {
  const lessons = getLessons();
  const existingIdx = lessons.findIndex((l) => l.id === lesson.id);
  if (existingIdx >= 0) {
    lessons[existingIdx] = lesson;
  } else {
    lessons.push(lesson);
  }
  saveLessons(lessons);
  return lessons;
}

export function deleteLesson(id: string): Lesson[] {
  const lessons = getLessons().filter((l) => l.id !== id);
  saveLessons(lessons);
  return lessons;
}

export function addQuestionToLesson(lessonId: string, question: Question): Lesson | null {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  lesson.questions.push(question);
  saveLessons(lessons);
  return lesson;
}

export function updateQuestionInLesson(lessonId: string, updatedQuestion: Question): Lesson | null {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  const idx = lesson.questions.findIndex((q) => q.id === updatedQuestion.id);
  if (idx >= 0) {
    lesson.questions[idx] = updatedQuestion;
    saveLessons(lessons);
  }
  return lesson;
}

export function deleteQuestionFromLesson(lessonId: string, questionId: string): Lesson | null {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  lesson.questions = lesson.questions.filter((q) => q.id !== questionId);
  saveLessons(lessons);
  return lesson;
}

export function bulkAddQuestionsToLesson(lessonId: string, newQuestions: Question[]): Lesson | null {
  const lessons = getLessons();
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;

  lesson.questions.push(...newQuestions);
  saveLessons(lessons);
  return lesson;
}

// =================== STUDENTS ===================

export function getStudents(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading students from localStorage:', e);
  }
  const seeded = initialStudents as User[];
  saveStudents(seeded);
  return seeded;
}

export function saveStudents(students: User[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function saveOrUpdateStudent(student: User): User[] {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === student.id || s.username === student.username);
  if (idx >= 0) {
    students[idx] = { ...students[idx], ...student };
  } else {
    students.push(student);
  }
  saveStudents(students);
  return students;
}

// =================== RESULTS ===================

export function getResults(): TestResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading results from localStorage:', e);
  }
  return [];
}

export function saveResult(result: TestResult): TestResult[] {
  const results = getResults();
  results.unshift(result); // latest first
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  return results;
}

// =================== BACKUP / EXPORT / IMPORT ===================

export interface FullBackupData {
  version: string;
  exportedAt: string;
  lessons: Lesson[];
  students: User[];
  results: TestResult[];
}

export function exportAllDataAsJson(): string {
  const data: FullBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    lessons: getLessons(),
    students: getStudents(),
    results: getResults(),
  };
  return JSON.stringify(data, null, 2);
}

export function triggerDownloadBackup(): void {
  const jsonStr = exportAllDataAsJson();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ntamath-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDataFromJson(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.lessons && Array.isArray(parsed.lessons)) {
      saveLessons(parsed.lessons);
    }
    if (parsed.students && Array.isArray(parsed.students)) {
      saveStudents(parsed.students);
    }
    if (parsed.results && Array.isArray(parsed.results)) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(parsed.results));
    }
    return { success: true, message: 'Ma\'lumotlar muvaffaqiyatli tiklandi va saqlandi!' };
  } catch (err: any) {
    return { success: false, message: `Import xatosi: ${err.message}` };
  }
}

export function resetAllToDefaults(): void {
  saveLessons(initialLessons as Lesson[]);
  saveStudents(initialStudents as User[]);
  localStorage.removeItem(STORAGE_KEYS.RESULTS);
}

