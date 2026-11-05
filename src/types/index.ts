export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string;
}

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string] | string[];
  correctOptionIndex: number; // 0 for A, 1 for B, 2 for C, 3 for D
  explanation?: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  description?: string;
  durationMinutes: number; // default 30
  questions: Question[]; // up to 100 questions per lesson
  createdAt: string;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionIndex: number | null; // null if skipped
}

export interface TestResult {
  id: string;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentUsername: string;
  studentFullName: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: Record<string, number | null>; // questionId -> selectedIndex
  questions: Question[]; // the 20 randomized questions used in this session
  telegramStatus?: {
    channelSent: boolean;
    adminSent: boolean;
    error?: string;
  };
}

export interface TelegramConfig {
  botToken: string;
  channelId: string;
  adminId: string;
}

export interface CloudSyncSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

