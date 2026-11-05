import { TestResult, TelegramConfig } from '../types';

// Default configuration from requirements
export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '9165520607:AAHcHBpeBnC4p3vepLbKmz_6_pg2YKAi-AA',
  channelId: import.meta.env.VITE_TELEGRAM_CHANNEL_ID || '-1004429502898',
  adminId: import.meta.env.VITE_TELEGRAM_ADMIN_ID || '1840817356',
};

// Key for saving custom credentials if updated by admin
const TELEGRAM_CONFIG_KEY = 'ntamath_telegram_config';

export function getTelegramConfig(): TelegramConfig {
  try {
    const saved = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load telegram config from localStorage:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
}

// Telegram WebApp window interface declaration
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date?: number;
          hash?: string;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

/**
 * Initializes the Telegram Mini App SDK environment
 */
export function initTelegramWebApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    try {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      console.log('Telegram WebApp successfully initialized');
    } catch (err) {
      console.warn('Error configuring Telegram WebApp SDK:', err);
    }
    return tg;
  }
  return null;
}

/**
 * Trigger haptic feedback if running inside Telegram
 */
export function triggerHaptic(type: 'success' | 'warning' | 'error' | 'impact') {
  try {
    const haptic = window.Telegram?.WebApp?.HapticFeedback;
    if (haptic) {
      if (type === 'impact') {
        haptic.impactOccurred('medium');
      } else {
        haptic.notificationOccurred(type);
      }
    }
  } catch (e) {
    // Ignore in browsers outside TG
  }
}

/**
 * Formats seconds into human-readable minutes and seconds (e.g. "14 daqiqa 25 soniya")
 */
function formatTimeUzbek(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs} soniya`;
  }
  if (secs === 0) {
    return `${mins} daqiqa`;
  }
  return `${mins} daqiqa ${secs} soniya`;
}

/**
 * Formats date into Uzbek timezone local string
 */
function formatDateUzbek(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Generates beautiful HTML message for Telegram
 */
export function createReportHtmlMessage(result: TestResult): string {
  const percentage = Math.round(result.percentage);
  let statusBadge = '🟢 A\'lo';
  if (percentage < 60) statusBadge = '🔴 Qoniqarsiz';
  else if (percentage < 80) statusBadge = '🟡 Yaxshi';

  const timeFormatted = formatTimeUzbek(result.timeSpentSeconds);
  const dateFormatted = formatDateUzbek(result.completedAt);

  return `
📊 <b>YANGI TEST NATIJASI | NTAMATH</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>O'quvchi:</b> ${escapeHtml(result.studentFullName)} (@${escapeHtml(result.studentUsername)})
📚 <b>Dars:</b> ${escapeHtml(result.lessonTitle)}

🎯 <b>Natija:</b> <code>${result.correctCount} / ${result.totalQuestions}</code> ta to'g'ri (${percentage}%)
📈 <b>Baho:</b> ${statusBadge}
⏱ <b>Sarflangan vaqt:</b> ${timeFormatted}
📅 <b>Sana va soat:</b> ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━━
✅ <i>Test muvaffaqiyatli topshirildi va tizimda qayd etildi.</i>
`.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sends test results directly to Telegram Channel and Admin via Bot API
 */
export async function sendTestReportToTelegram(result: TestResult): Promise<{
  channelSent: boolean;
  adminSent: boolean;
  error?: string;
}> {
  const config = getTelegramConfig();
  const botToken = config.botToken.trim();
  const channelId = config.channelId.trim();
  const adminId = config.adminId.trim();

  if (!botToken) {
    return {
      channelSent: false,
      adminSent: false,
      error: 'Telegram Bot Token belgilanmagan!',
    };
  }

  const messageText = createReportHtmlMessage(result);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  let channelSent = false;
  let adminSent = false;
  let lastError = '';

  // 1. Send to Telegram Channel
  if (channelId) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        channelSent = true;
      } else {
        lastError = `Kanalga yuborishda xato: ${data.description || 'Noma\'lum'}`;
        console.warn(lastError);
      }
    } catch (err: any) {
      lastError = `Kanalga tarmoq xatosi: ${err.message}`;
      console.warn(lastError);
    }
  }

  // 2. Send to Admin Private Chat
  if (adminId) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminId,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        adminSent = true;
      } else {
        const adminErr = `Adminga yuborishda xato: ${data.description || 'Noma\'lum'}`;
        console.warn(adminErr);
        if (!lastError) lastError = adminErr;
      }
    } catch (err: any) {
      const adminErr = `Adminga tarmoq xatosi: ${err.message}`;
      console.warn(adminErr);
      if (!lastError) lastError = adminErr;
    }
  }

  return {
    channelSent,
    adminSent,
    error: lastError || undefined,
  };
}

