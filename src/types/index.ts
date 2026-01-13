// ==================== AUTH ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ==================== USER ====================
export interface User {
  id: string;
  email: string | null;
  username: string;
  fullName: string;
  avatar: string | null;
  bio: string | null;
  totalXP: number;
  level: number;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  telegramId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  testAttempts?: TestAttempt[];
  categoryStats?: CategoryStat[];
  userAchievements?: UserAchievement[];
}

// ==================== CATEGORY ====================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  difficultyLevels?: string[];
  _count?: {
    questions: number;
    testAttempts: number;
  };
}

export interface CategoryStat {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  totalXP: number;
  averageScore: number;
  bestScore: number;
  updatedAt: string;
}

// ==================== QUESTION ====================
export interface Question {
  id: string;
  categoryId: string;
  category?: Category;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  tags: string[];
  isActive: boolean;
}

// ==================== TEST ====================
export interface TestAttempt {
  id: string;
  userId: string;
  categoryId: string | null;
  category?: Category;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number | null;
  completedAt: string;
  testAnswers?: TestAnswer[];
}

export interface TestAnswer {
  id: string;
  testAttemptId: string;
  questionId: string;
  question?: Question;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number | null;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
}

export interface StartTestResponse {
  testAttemptId: string;
  questions: TestQuestion[];
  totalQuestions: number;
}

export interface TestResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number | null;
  leveledUp: boolean;
  newLevel: number | null;
  newAchievements: Achievement[];
  answers: {
    questionId: string;
    question: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string | null;
    xpReward: number;
  }[];
}

// ==================== LEADERBOARD ====================
export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  totalXP: number;
  level: number;
  testsCount?: number;
}

export interface MyRank {
  global: number;
  weekly: number;
  monthly: number;
}

// ==================== AI ====================
export interface AIChat {
  id: string;
  userId: string;
  message: string;
  response: string;
  categoryId: string | null;
  category?: Category;
  tokens: number | null;
  createdAt: string;
}

export interface AIUsage {
  todayCount: number;
  dailyLimit: number;
  totalCount: number;
}

// ==================== ACHIEVEMENT ====================
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  unlockedAt: string;
  progress?: number;
  target?: number;
}

// ==================== NOTIFICATION ====================
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'ACHIEVEMENT' | 'LEVEL_UP' | 'RANKING' | 'MESSAGE';
  isRead: boolean;
  createdAt: string;
}

// ==================== API RESPONSES ====================
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}
