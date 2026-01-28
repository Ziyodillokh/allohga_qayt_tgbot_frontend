"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit2,
  Trophy,
  Target,
  Zap,
  Clock,
  TrendingUp,
  ChevronRight,
  Award,
  BarChart3,
  Code,
  Github,
  Instagram,
  Globe,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  Star,
  Calendar,
  BookOpen,
  Settings,
  User,
  Crown,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks";
import { useAuthStore } from "@/store/auth";
import { usersApi, achievementsApi } from "@/lib/api";
import { Button, Card, Badge, Progress } from "@/components/ui";
import {
  formatXP,
  calculateLevelProgress,
  formatDate,
  cn,
  getScoreColor,
  getUploadUrl,
} from "@/lib/utils";
import toast from "react-hot-toast";

interface CategoryStat {
  id: string;
  categoryId: string;
  category: { name: string; icon: string; color: string };
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  totalXP: number;
  averageScore: number;
  bestScore: number;
}

interface TestHistory {
  id: string;
  category: { name: string; icon: string } | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  completedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  condition?: { type: string; value: number };
}

interface MyStats {
  totalXP: number;
  level: number;
  levelProgress: number;
  xpToNextLevel: number;
  totalZikr: number;
  totalTests: number;
  totalCorrect: number;
  totalWrong: number;
  totalQuestions: number;
  averageScore: number;
  bestScore: number;
  weeklyXP: number;
  monthlyXP: number;
  testsCompleted: number;
  memberSince: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
  } = useAuth();
  const { setUser } = useAuthStore();

  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [achievements, setAchievements] = useState<{
    unlocked: Achievement[];
    locked: Achievement[];
  }>({
    unlocked: [],
    locked: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "stats" | "history" | "developer" | "achievements"
  >("stats");

  useEffect(() => {
    // Telegram webapp'da avtomatik auth bo'ladi, redirect qilmaslik
    // Agar auth bo'lmasa, loading holatida kutish
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        // Avval yutuqlarni tekshirib yangilash
        try {
          await achievementsApi.check();
        } catch (e) {
          console.log("Achievements check failed, continuing...");
        }

        // Barcha ma'lumotlarni parallel olish
        const [profileRes, statsRes, historyRes, achievementsRes, myStatsRes] =
          await Promise.all([
            usersApi.getProfile(),
            usersApi.getCategoryStats(),
            usersApi.getTestHistory(1, 10),
            achievementsApi.getAll(),
            usersApi.getMyStats().catch(() => ({ data: null })),
          ]);

        // User ma'lumotlarini yangilash
        const profileData = profileRes.data;
        if (profileData) {
          const currentUser = useAuthStore.getState().user;
          const avatarToUse = profileData.avatar || currentUser?.avatar || null;
          setUser({
            ...profileData,
            avatar: avatarToUse,
            totalXP: profileData.totalXP ?? 0,
            level: profileData.level ?? 1,
          });
        }

        // My Stats
        if (myStatsRes.data) {
          setMyStats(myStatsRes.data);
        }

        setCategoryStats(statsRes.data || []);

        // testHistory array
        const historyData =
          historyRes.data?.tests ||
          historyRes.data?.history ||
          historyRes.data?.data ||
          historyRes.data;
        setTestHistory(Array.isArray(historyData) ? historyData : []);

        // Yutuqlar
        const achData = achievementsRes.data;
        const achArray = Array.isArray(achData) ? achData : [];

        setAchievements({
          unlocked: achArray.filter((a: any) => a.unlocked || a.unlockedAt),
          locked: achArray.filter((a: any) => !a.unlocked && !a.unlockedAt),
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, updateUser]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const levelProgress = calculateLevelProgress(user.totalXP);
  const stats = myStats || {
    totalXP: user.totalXP || 0,
    level: user.level || 1,
    levelProgress: levelProgress.percentage,
    xpToNextLevel: levelProgress.required - levelProgress.current,
    totalZikr: (user as any).zikrCount || 0,
    totalTests: categoryStats.reduce((sum, s) => sum + s.totalTests, 0),
    totalCorrect: categoryStats.reduce((sum, s) => sum + s.correctAnswers, 0),
    totalWrong: categoryStats.reduce(
      (sum, s) => sum + (s.totalQuestions - s.correctAnswers),
      0,
    ),
    totalQuestions: categoryStats.reduce((sum, s) => sum + s.totalQuestions, 0),
    averageScore:
      categoryStats.length > 0
        ? categoryStats.reduce((sum, s) => sum + s.averageScore, 0) /
          categoryStats.length
        : 0,
    bestScore:
      categoryStats.length > 0
        ? Math.max(...categoryStats.map((s) => s.bestScore))
        : 0,
    weeklyXP: 0,
    monthlyXP: 0,
    testsCompleted: (user as any).testsCompleted || 0,
    memberSince: (user as any).createdAt || new Date().toISOString(),
  };

  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#0F0D0A] relative overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-gradient-radial from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-gradient-radial from-[#AA8232]/15 via-[#AA8232]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-[#1E1C18]/60 border border-[#D4AF37]/10 backdrop-blur-xl hover:bg-[#1E1C18] hover:border-[#D4AF37]/30 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
          </button>

          <h1 className="text-lg font-bold text-white">Profil</h1>

          <Link
            href="/profile/settings"
            className="p-3 rounded-2xl bg-[#1E1C18]/60 border border-[#D4AF37]/10 backdrop-blur-xl hover:bg-[#1E1C18] hover:border-[#D4AF37]/30 transition-all group"
          >
            <Settings className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
          </Link>
        </header>

        {/* Profile Card */}
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                key={user.avatar || "no-avatar"}
                className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/20"
              >
                {user.avatar ? (
                  <img
                    key={`avatar-img-${user.avatar}`}
                    src={getUploadUrl(user.avatar) || undefined}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn("[Profile] Avatar yuklanmadi:", user.avatar);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/30 to-[#AA8232]/30 flex items-center justify-center">
                    <User className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                )}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8232] flex items-center justify-center border-2 border-[#0F0D0A] shadow-lg">
                <span className="text-xs font-black text-[#0F0D0A]">
                  {stats.level}
                </span>
              </div>
            </div>

            {/* Name & username */}
            <h2 className="text-xl font-bold text-white mb-1">
              {user.fullName}
            </h2>
            <p className="text-sm text-[#9A8866] mb-3">@{user.username}</p>

            {/* Level progress */}
            <div className="w-full max-w-[200px] mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#9A8866]">Level {stats.level}</span>
                <span className="text-[#D4AF37]">Level {stats.level + 1}</span>
              </div>
              <div className="h-2 bg-[#1E1C18] rounded-full overflow-hidden border border-[#D4AF37]/10">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FBF0B2] rounded-full transition-all duration-500"
                  style={{ width: `${stats.levelProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-center text-[#9A8866] mt-1.5">
                {formatXP(stats.xpToNextLevel)} XP keyingi levelgacha
              </p>
            </div>

            {/* Edit button */}
            <Link href="/profile/edit">
              <button className="px-5 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/20 transition-all flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Tahrirlash
              </button>
            </Link>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Umumiy Statistika
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Total XP */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-xl group-hover:bg-[#D4AF37]/10 transition-colors"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <p className="text-2xl font-black text-white mb-0.5">
                  {formatXP(stats.totalXP)}
                </p>
                <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                  Jami XP
                </p>
              </div>
            </div>

            {/* Zikr Count */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#22c55e]/5 rounded-full blur-xl group-hover:bg-[#22c55e]/10 transition-colors"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mb-3">
                  <span className="text-xl">📿</span>
                </div>
                <p className="text-2xl font-black text-white mb-0.5">
                  {stats.totalZikr.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                  Jami Zikr
                </p>
              </div>
            </div>

            {/* Tests Completed */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#3b82f6]/5 rounded-full blur-xl group-hover:bg-[#3b82f6]/10 transition-colors"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <p className="text-2xl font-black text-white mb-0.5">
                  {stats.totalTests}
                </p>
                <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                  Jami Test
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a855f7]/5 rounded-full blur-xl group-hover:bg-[#a855f7]/10 transition-colors"></div>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5 text-[#a855f7]" />
                </div>
                <p className="text-2xl font-black text-white mb-0.5">
                  {achievements.unlocked.length}
                </p>
                <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                  Yutuqlar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Accuracy Card */}
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>

          <h3 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
            Test Natijalari
          </h3>

          <div className="relative flex items-center gap-6">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1E1C18"
                  strokeWidth="10"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={
                    accuracy >= 70
                      ? "#22c55e"
                      : accuracy >= 50
                        ? "#D4AF37"
                        : "#ef4444"
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${accuracy * 2.64} 264`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">
                  {accuracy}%
                </span>
                <span className="text-[9px] text-[#9A8866] uppercase">
                  Aniqlik
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#9A8866]">To'g'ri javoblar</p>
                  <p className="text-lg font-bold text-[#22c55e]">
                    {stats.totalCorrect}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#9A8866]">Noto'g'ri javoblar</p>
                  <p className="text-lg font-bold text-[#ef4444]">
                    {stats.totalWrong}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D4AF37]/10">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9A8866]">Jami savollar:</span>
                  <span className="text-white font-medium">
                    {stats.totalQuestions}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Best & Average Score */}
          <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <Star className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {Math.round(stats.bestScore)}%
              </p>
              <p className="text-[10px] text-[#9A8866]">Eng yaxshi ball</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/10">
              <TrendingUp className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
              <p className="text-xl font-bold text-white">
                {Math.round(stats.averageScore)}%
              </p>
              <p className="text-[10px] text-[#9A8866]">O'rtacha ball</p>
            </div>
          </div>
        </div>

        {/* XP Progress Card */}
        {(stats.weeklyXP > 0 || stats.monthlyXP > 0) && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/20">
            <h3 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f97316]" />
              XP Jarayoni
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-[#f97316]/5 border border-[#f97316]/10">
                <p className="text-2xl font-black text-white">
                  +{formatXP(stats.weeklyXP)}
                </p>
                <p className="text-[10px] text-[#9A8866]">Bu hafta</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10">
                <p className="text-2xl font-black text-white">
                  +{formatXP(stats.monthlyXP)}
                </p>
                <p className="text-[10px] text-[#9A8866]">Bu oy</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "stats", label: "Statistika", icon: BarChart3 },
            { id: "history", label: "Tarix", icon: Clock },
            { id: "achievements", label: "Yutuqlar", icon: Award },
            { id: "developer", label: "Dev", icon: Code },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap text-sm transition-all",
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#0F0D0A]"
                  : "bg-[#1E1C18] text-[#9A8866] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              Kategoriya Statistikasi
            </h2>

            {categoryStats.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#1E1C18] border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-[#D4AF37]/50" />
                </div>
                <p className="text-[#9A8866] mb-2">Hali test topshirmadingiz</p>
                <Link href="/test">
                  <button className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0F0D0A] font-medium text-sm hover:bg-[#FBF0B2] transition-colors">
                    Test boshlash
                  </button>
                </Link>
              </div>
            ) : (
              categoryStats.map((stat) => (
                <div
                  key={stat.id}
                  className="p-4 rounded-2xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${stat.category.color}20` }}
                    >
                      {stat.category.icon?.startsWith("/") ? (
                        <Image
                          src={
                            getUploadUrl(stat.category.icon) ||
                            stat.category.icon
                          }
                          alt={stat.category.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span>{stat.category.icon || "📝"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">
                        {stat.category.name}
                      </h3>
                      <p className="text-xs text-[#9A8866]">
                        {stat.totalTests} ta test • {formatXP(stat.totalXP)} XP
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-xl font-bold",
                          stat.averageScore >= 70
                            ? "text-[#22c55e]"
                            : stat.averageScore >= 50
                              ? "text-[#D4AF37]"
                              : "text-[#ef4444]",
                        )}
                      >
                        {Math.round(stat.averageScore)}%
                      </p>
                      <p className="text-[10px] text-[#9A8866]">o'rtacha</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#D4AF37]/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9A8866]">
                        Eng yaxshi: {Math.round(stat.bestScore)}%
                      </span>
                      <span className="text-[#9A8866]">
                        {stat.correctAnswers}/{stat.totalQuestions} to'g'ri
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              Test Tarixi
            </h2>

            {testHistory.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#1E1C18] border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-[#D4AF37]/50" />
                </div>
                <p className="text-[#9A8866]">Hali test topshirmadingiz</p>
              </div>
            ) : (
              testHistory.map((test) => (
                <Link key={test.id} href={`/test/result/${test.id}`}>
                  <div className="p-4 rounded-2xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1E1C18] rounded-xl flex items-center justify-center text-2xl overflow-hidden border border-[#D4AF37]/10">
                      {test.category?.icon?.startsWith("/") ? (
                        <Image
                          src={
                            getUploadUrl(test.category.icon) ||
                            test.category.icon
                          }
                          alt={test.category?.name || ""}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span>{test.category?.icon || "📝"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">
                        {test.category?.name || "Aralash test"}
                      </h3>
                      <p className="text-xs text-[#9A8866]">
                        {formatDate(test.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-bold",
                          test.score >= 70
                            ? "text-[#22c55e]"
                            : test.score >= 50
                              ? "text-[#D4AF37]"
                              : "text-[#ef4444]",
                        )}
                      >
                        {test.score}%
                      </p>
                      <p className="text-[10px] text-[#D4AF37]">
                        +{test.xpEarned} XP
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#D4AF37]/40" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="space-y-6">
            {/* Unlocked */}
            <div>
              <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] px-1 mb-4 flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                Olingan yutuqlar ({achievements.unlocked.length})
              </h2>

              {achievements.unlocked.length === 0 ? (
                <div className="text-center py-8 px-6 rounded-2xl bg-[#1E1C18]/50 border border-[#D4AF37]/10">
                  <p className="text-[#9A8866]">Hali yutuq olmadingiz</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {achievements.unlocked.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 text-center"
                    >
                      <span className="text-3xl">{ach.icon}</span>
                      <h3 className="font-bold text-white mt-2 text-sm">
                        {ach.name}
                      </h3>
                      <p className="text-[10px] text-[#9A8866] mt-1 line-clamp-2">
                        {ach.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[10px] font-medium text-[#D4AF37]">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked */}
            <div>
              <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] px-1 mb-4">
                Olinmagan yutuqlar ({achievements.locked.length})
              </h2>

              {achievements.locked.length === 0 ? (
                <div className="text-center py-8 px-6 rounded-2xl bg-[#1E1C18]/50 border border-[#D4AF37]/10">
                  <Trophy className="w-10 h-10 mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-[#9A8866]">
                    Barcha yutuqlarni oldingiz! 🎉
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {achievements.locked.map((ach) => {
                    const target = ach.target || 0;
                    const progress = ach.progress || 0;
                    const percentage =
                      target > 0 ? Math.min(100, (progress / target) * 100) : 0;

                    return (
                      <div
                        key={ach.id}
                        className="p-4 rounded-2xl bg-[#1E1C18]/50 border border-[#D4AF37]/10 text-center opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <span className="text-3xl grayscale">{ach.icon}</span>
                        <h3 className="font-bold text-white mt-2 text-sm">
                          {ach.name}
                        </h3>
                        <p className="text-[10px] text-[#9A8866] mt-1 line-clamp-2">
                          {ach.description}
                        </p>
                        {target > 0 && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-[#0F0D0A] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D4AF37]/50 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-[#9A8866] mt-1">
                              {progress}/{target}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Developer ID Passport */}
        {activeTab === "developer" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#D4AF37]" />
              Dasturchi ID Passporti
            </h2>

            {/* ID Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1C18] via-[#0F0E0A] to-[#1E1C18] p-1 border border-[#D4AF37]/20">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5" />

              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-[#AA8232] rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-[#0F0D0A]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                        Developer ID
                      </p>
                      <p className="text-white font-bold text-sm">TAVBA</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#9A8866]">ID: #001</p>
                    <p className="text-[10px] text-[#22c55e]">✓ Verified</p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-4 mb-5">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/10">
                      <Image
                        src="/img/dev-profile.jpg"
                        alt="Developer"
                        width={96}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-[10px] text-[#9A8866] uppercase">
                        To'liq ism
                      </p>
                      <p className="text-base font-bold text-white">
                        Shokirjonov Bekmuhammad
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866] uppercase">
                        Mutaxassislik
                      </p>
                      <p className="text-xs text-[#D4AF37] font-medium">
                        Full Stack Developer
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866]">Stack</p>
                      <p className="text-[10px] text-white/70">
                        React, Next.js, NestJS, NodeJS
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://t.me/Khamidov_online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#0F0D0A]/50 rounded-xl hover:bg-[#0F0D0A] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center">
                      <Send className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866]">Telegram</p>
                      <p className="text-xs text-white group-hover:text-[#3b82f6] transition-colors">
                        @Khamidov_online
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/khamidov__online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#0F0D0A]/50 rounded-xl hover:bg-[#0F0D0A] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#ec4899]/10 rounded-lg flex items-center justify-center">
                      <Instagram className="w-4 h-4 text-[#ec4899]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866]">Instagram</p>
                      <p className="text-xs text-white group-hover:text-[#ec4899] transition-colors">
                        @khamidov__online
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://github.com/Bekmuhammad-Devoloper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#0F0D0A]/50 rounded-xl hover:bg-[#0F0D0A] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Github className="w-4 h-4 text-white/80" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866]">GitHub</p>
                      <p className="text-xs text-white group-hover:text-white/80 transition-colors">
                        Bekmuhammad
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://bekmuhammad.uz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-[#0F0D0A]/50 rounded-xl hover:bg-[#0F0D0A] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#22c55e]/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[#22c55e]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9A8866]">Portfolio</p>
                      <p className="text-xs text-white group-hover:text-[#22c55e] transition-colors">
                        bekmuhammad.uz
                      </p>
                    </div>
                  </a>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-[#D4AF37]/10 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                    <span className="text-[10px] text-[#9A8866]">
                      Faol dasturchi
                    </span>
                  </div>
                  <p className="text-[10px] text-[#9A8866]">
                    В© 2025 Allohga Qayting
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#9A8866] flex items-center justify-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            A'zo bo'lgan: {formatDate(stats.memberSince)}
          </p>
        </div>
      </div>
    </div>
  );
}
