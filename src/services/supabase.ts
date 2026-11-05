import { Lesson, TestResult, User } from '../types';
import { getLessons, getResults, getStudents, saveLessons, saveStudents } from './storage';

const SUPABASE_STORAGE_KEY = 'ntamath_supabase_settings';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load Supabase settings:', e);
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    autoSync: false,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(config));
}

/**
 * SQL Schema for Supabase Table Creation:
 * 
 * CREATE TABLE IF NOT EXISTS public.ntamath_sync (
 *   key text PRIMARY KEY,
 *   data jsonb NOT NULL,
 *   updated_at timestamptz DEFAULT now()
 * );
 * 
 * -- Enable RLS or Public Access for anonymous REST:
 * ALTER TABLE public.ntamath_sync ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Allow anonymous read/write" ON public.ntamath_sync
 *   FOR ALL TO anon USING (true) WITH CHECK (true);
 */

/**
 * Pushes all local data to Supabase KV store table `ntamath_sync`
 */
export async function pushDataToSupabase(): Promise<{ success: boolean; message: string }> {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Supabase URL yoki Anon Key kiritilmagan!' };
  }

  const endpoint = `${config.url.replace(/\/+$/, '')}/rest/v1/ntamath_sync`;
  const payload = [
    { key: 'lessons', data: getLessons(), updated_at: new Date().toISOString() },
    { key: 'students', data: getStudents(), updated_at: new Date().toISOString() },
    { key: 'results', data: getResults(), updated_at: new Date().toISOString() },
  ];

  try {
    const response = await fetch(`${endpoint}?on_conflict=key`, {
      method: 'POST',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, message: `Supabase xatosi (${response.status}): ${errText}` };
    }

    return { success: true, message: 'Barcha ma\'lumotlar Supabase bulut bazasiga muvaffaqiyatli sinxronlandi!' };
  } catch (err: any) {
    return { success: false, message: `Tarmoq xatosi: ${err.message}` };
  }
}

/**
 * Pulls latest data from Supabase
 */
export async function pullDataFromSupabase(): Promise<{ success: boolean; message: string }> {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Supabase URL yoki Anon Key kiritilmagan!' };
  }

  const endpoint = `${config.url.replace(/\/+$/, '')}/rest/v1/ntamath_sync?select=*`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, message: `Supabase xatosi (${response.status}): ${errText}` };
    }

    const records: Array<{ key: string; data: any }> = await response.json();
    for (const record of records) {
      if (record.key === 'lessons' && Array.isArray(record.data)) {
        saveLessons(record.data as Lesson[]);
      } else if (record.key === 'students' && Array.isArray(record.data)) {
        saveStudents(record.data as User[]);
      } else if (record.key === 'results' && Array.isArray(record.data)) {
        localStorage.setItem('ntamath_results_v1', JSON.stringify(record.data));
      }
    }

    return { success: true, message: 'Bulutdan eng so\'nggi ma\'lumotlar muvaffaqiyatli yuklab olindi!' };
  } catch (err: any) {
    return { success: false, message: `Tarmoq xatosi: ${err.message}` };
  }
}

