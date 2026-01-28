import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../store";

// API URL - production da /api, development da localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Auth endpointlarida 401 xatosi bilan logout qilmaslik
    const url = error.config?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/telegram/webapp/auth");

    // Faqat logout qilish - redirect qilmaslik (Telegram webapp uchun)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      // Telegram webapp'da avtomatik qayta auth bo'ladi
    }
    return Promise.reject(error);
  },
);

// ==================== AUTH ====================
export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
    telegramPhone?: string;
  }) => api.post("/auth/register", data),

  login: (data: { emailOrUsername: string; password: string }) =>
    api.post("/auth/login", data),

  telegramAuth: (initData: string) =>
    api.post("/telegram/webapp/auth", { initData }),

  getProfile: () => api.get("/auth/profile"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/auth/change-password", data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),
};

// ==================== USERS ====================
export const usersApi = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data: { fullName?: string; bio?: string }) =>
    api.patch("/users/profile", data),

  getCategoryStats: () => api.get("/users/stats/categories"),

  getTestHistory: (page = 1, limit = 10) =>
    api.get(`/users/history/tests?page=${page}&limit=${limit}`),

  // Foydalanuvchi statistikasi (profil sahifasi uchun)
  getMyStats: () => api.get("/users/my-stats"),
};

// ==================== CATEGORIES ====================
export const categoriesApi = {
  getAll: () => api.get("/categories"),

  getBySlug: (slug: string) => api.get(`/categories/${slug}`),

  getStats: (id: string) => api.get(`/categories/${id}/stats`),
};

// ==================== TESTS ====================
export const testsApi = {
  start: (data: { categoryId?: string; questionsCount?: number }) =>
    api.post("/tests/start", data),

  submit: (
    testId: string,
    answers: Array<{ questionId: string; selectedAnswer: number }>,
  ) => api.post(`/tests/${testId}/submit`, { answers }),

  getResult: (testId: string) => api.get(`/tests/${testId}/result`),

  getHistory: (page = 1, limit = 10) =>
    api.get(`/tests/history?page=${page}&limit=${limit}`),

  getStats: () => api.get("/tests/stats"),

  getUserStats: () => api.get("/tests/user-stats"),

  createRetryTest: (categoryId?: string) =>
    api.post("/tests/retry", { categoryId }),
};

// ==================== LEADERBOARD ====================
export const leaderboardApi = {
  getGlobal: (page = 1, limit = 100) =>
    api.get(`/leaderboard/global?page=${page}&limit=${limit}`),

  getCategory: (categoryId: string, page = 1, limit = 50) =>
    api.get(`/leaderboard/category/${categoryId}?page=${page}&limit=${limit}`),

  getWeekly: (page = 1, limit = 50) =>
    api.get(`/leaderboard/weekly?page=${page}&limit=${limit}`),

  getMonthly: (page = 1, limit = 50) =>
    api.get(`/leaderboard/monthly?page=${page}&limit=${limit}`),

  getMyRank: () => api.get("/leaderboard/my-rank"),
};

// ==================== AI ====================
export const aiApi = {
  chat: (message: string, audioBase64?: string, categorySlug?: string) =>
    api.post("/ai/chat", { message, audioBase64, categorySlug }),

  getHistory: (page = 1, limit = 50) =>
    api.get(`/ai/history?page=${page}&limit=${limit}`),

  getUsage: () => api.get("/ai/usage"),

  clearHistory: () => api.delete("/ai/history"),
};

// ==================== ACHIEVEMENTS ====================
export const achievementsApi = {
  getAll: () => api.get("/achievements"),

  getMy: () => api.get("/achievements/my"),

  check: () => api.post("/achievements/check"),
};

// ==================== NOTIFICATIONS ====================
export const notificationsApi = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`),

  getUnreadCount: () => api.get("/notifications/unread-count"),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch("/notifications/read-all"),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ==================== UPLOAD ====================
export const uploadApi = {
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // Token olish store'dan
    const token = useAuthStore.getState().token;

    // Axios FormData yuborilganda Content-Type ni o'zi qo'yadi,
    // lekin biz default 'application/json' ni override qilishimiz kerak
    return axios.post(`${API_URL}/upload/avatar`, formData, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Content-Type ni umuman qo'ymaslik - axios FormData uchun avtomatik multipart/form-data + boundary qo'yadi
      },
    });
  },
};

// ==================== STATS ====================
export const statsApi = {
  getPublic: async () => {
    const response = await api.get("/stats/public");
    return response;
  },
};

// ==================== ZIKR ====================
export const zikrApi = {
  // Bugungi kunning zikrlarini olish
  getToday: (ramadan = false) =>
    api.get(`/zikr/today${ramadan ? "?ramadan=true" : ""}`),

  // Ma'lum kunning zikrlarini olish (0=Yakshanba, 1=Dushanba, ...)
  getByDay: (dayOfWeek: number, ramadan = false) =>
    api.get(`/zikr/day/${dayOfWeek}${ramadan ? "?ramadan=true" : ""}`),

  // Haftalik barcha zikrlarni olish
  getWeekly: (ramadan = false) =>
    api.get(`/zikr/weekly${ramadan ? "?ramadan=true" : ""}`),

  // Statistika
  getStats: () => api.get("/zikr/stats"),

  // ID bo'yicha zikrni olish
  getById: (id: string) => api.get(`/zikr/${id}`),

  // Zikrni bajarish va XP olish
  complete: (id: string) => api.post(`/zikr/${id}/complete`),

  // Foydalanuvchining bugungi zikrlari (completion status bilan)
  getUserToday: () => api.get("/zikr/user/today"),

  // Foydalanuvchining zikr statistikasi
  getUserStats: () => api.get("/zikr/user/stats"),
};

export default api;
