import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format XP number
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Calculate level from XP
export function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

// Calculate XP progress for current level
export function calculateLevelProgress(xp: number): { current: number; required: number; percentage: number } {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8500, 13000, 20000];
  const level = calculateLevel(xp);
  
  const currentThreshold = thresholds[level - 1] || 0;
  const nextThreshold = thresholds[level] || currentThreshold + 10000;
  
  const current = xp - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const percentage = Math.min(100, (current / required) * 100);
  
  return { current, required, percentage };
}

// Format date
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Invalid date check
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'hozirgina';
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays < 7) return `${diffDays} kun oldin`;
  
  return formatDate(date);
}

// Format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Get difficulty color
export function getDifficultyColor(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-500 bg-green-500/10';
    case 'MEDIUM':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'HARD':
      return 'text-red-500 bg-red-500/10';
  }
}

// Get difficulty label
export function getDifficultyLabel(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  switch (difficulty) {
    case 'EASY':
      return 'Oson';
    case 'MEDIUM':
      return 'O\'rta';
    case 'HARD':
      return 'Qiyin';
  }
}

// Get score color
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate avatar placeholder
export function getAvatarPlaceholder(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return initials || '?';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Backend URL helper - uploads uchun
export function getBackendUrl(): string {
  // NEXT_PUBLIC_UPLOADS_URL mavjud bo'lsa, uni ishlatamiz
  if (process.env.NEXT_PUBLIC_UPLOADS_URL) {
    return process.env.NEXT_PUBLIC_UPLOADS_URL;
  }
  
  // API URL dan uploads URL yasash
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Agar api.domain.com/api formatida bo'lsa
  if (apiUrl.includes('api.') && apiUrl.endsWith('/api')) {
    return apiUrl.replace('/api', '');
  }
  
  // Agar domain.com/api formatida bo'lsa, api.domain.com ga o'zgartirish
  if (apiUrl.endsWith('/api')) {
    const url = new URL(apiUrl);
    return `${url.protocol}//api.${url.host.replace('www.', '')}`;
  }
  
  return apiUrl.replace('/api', '') || 'http://localhost:3001';
}

// Upload qilingan fayllar uchun to'liq URL olish
export function getUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // Agar to'liq URL bo'lsa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Agar /uploads/ yoki /attachments/ bilan boshlansa
  if (path.startsWith('/uploads/') || path.startsWith('/attachments/')) {
    return `${getBackendUrl()}${path}`;
  }
  
  // Agar /img/ bilan boshlansa - frontend local
  if (path.startsWith('/img/')) {
    return path;
  }
  
  // Default - backend'ga yo'naltirish
  return `${getBackendUrl()}${path.startsWith('/') ? path : '/' + path}`;
}

// Kategoriya icon olish - umumiy funksiya
export function getCategoryIconUrl(slug: string, apiIcon?: string | null): string | null {
  const iconMap: Record<string, string> = {
    'cpp': '/img/c++-logo.png',
    'c++': '/img/c++-logo.png',
    'django': '/img/django-logo.png',
    'docker': '/img/docker-logo.png',
    'ingliz-tili': '/img/english-logo.png',
    'english': '/img/english-logo.png',
    'express': '/img/express.js-logo.png',
    'expressjs': '/img/express.js-logo.png',
    'fizika': '/img/fizika-logo.png',
    'git': '/img/git-logo.png',
    'go': '/img/Go-Logo_Aqua.png',
    'golang': '/img/Go-Logo_Aqua.png',
    'tarix': '/img/history-logo.png',
    'history': '/img/history-logo.png',
    'html-css': '/img/html-css-logo.png',
    'html': '/img/html-css-logo.png',
    'html and css': '/img/html-css-logo.png',
    'java': '/img/Java-logo.png',
    'javascript': '/img/JavaScript-logo.png',
    'linux': '/img/linux-logo.png',
    'matematika': '/img/matematika-logo.png',
    'majburiy-matematika': '/img/matematika-logo.png',
    'mongodb': '/img/mongodb-logo.png',
    'nestjs': '/img/nestjs-logo.png',
    'next': '/img/next.js-logo.png',
    'nextjs': '/img/next.js-logo.png',
    'nodejs': '/img/node.js-logo.png',
    'node': '/img/node.js-logo.png',
    'node.js': '/img/node.js-logo.png',
    'postgresql': '/img/postgreSql-logo.png',
    'postgres': '/img/postgreSql-logo.png',
    'python': '/img/Python-logo.png',
    'react': '/img/react-logo.png',
    'redis': '/img/redis-logo.png',
    'rust': '/img/rust-logo.png',
    'sql': '/img/sql-logo.png',
    'tailwind': '/img/tailwind-css-logo.png',
    'tailwind-css': '/img/tailwind-css-logo.png',
    'tailwind css': '/img/tailwind-css-logo.png',
    'typescript': '/img/TypeScript-logo.png',
    'vue': '/img/vue.js-logo.png',
    'vue.js': '/img/vue.js-logo.png',
    'vuejs': '/img/vue.js-logo.png',
  };
  
  const slugLower = slug?.toLowerCase() || '';
  
  // 1. Agar API'dan icon kelgan bo'lsa va u /uploads/ bilan boshlansa - birinchi prioritet
  if (apiIcon && apiIcon.startsWith('/uploads/')) {
    return getUploadUrl(apiIcon);
  }
  
  // 2. Local iconMap'da tekshirish
  if (iconMap[slugLower]) {
    return iconMap[slugLower];
  }
  
  // 3. API'dan kelgan boshqa iconlar
  if (apiIcon) {
    return getUploadUrl(apiIcon);
  }
  
  return null;
}
