"use client";

import Link from "next/link";
import { Heart, Flame, BookOpen, ArrowRight } from "lucide-react";
import { useAuth, useStats } from "@/hooks";
import { Button, Card, Progress } from "@/components/ui";
import { formatXP, calculateLevelProgress } from "@/lib/utils";
import { isTelegramWebApp } from "@/lib/telegram";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { stats, loading: statsLoading } = useStats();
  const isTelegram = isTelegramWebApp();

  return (
    <div className="min-h-screen bg-white">
      {/* Safe Area Wrapper for Telegram */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-1 p-4 space-y-6 pt-6">
          {/* 1. AI Recommendation Card - TOP PRIORITY */}
          <section>
            <div className="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_1px)] bg-[length:20px_20px]" />
              </div>

              <div className="relative z-10">
                <h2 className="text-sm font-semibold text-white/90 mb-2">
                  Bugun siz uchun
                </h2>

                <p className="text-2xl font-bold mb-4 leading-snug">
                  "Albatta, Rabbim farzand shodini emas..."
                </p>

                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Tavbani qabul qiluvchi va mehribon Rabbimizga tawaakkalni
                  qayta başlayin. Har bir kun yangi imkon, yangi umid.
                </p>

                <Link href="/test/islamic">
                  <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-semibold rounded-full h-11 shadow-md hover:shadow-lg transition-all">
                    Boshlash
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>

                <button className="mt-4 w-full flex items-center justify-center gap-2 text-white/80 hover:text-white transition-colors py-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Saqlash</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. User Progress Section (if authenticated) - SUBTLE */}
          {isAuthenticated && user && (
            <section>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">
                      Assalomu alaikum, {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Level {user.level} •{" "}
                      {Math.round(
                        calculateLevelProgress(user.totalXP).percentage
                      )}
                      % tayyor
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">
                        {formatXP(user.totalXP)}
                      </p>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress
                    value={calculateLevelProgress(user.totalXP).percentage}
                    className="h-2 bg-amber-200"
                  />
                </div>
              </div>
            </section>
          )}

          {/* 3. Daily Adhkar Section - SPIRITUAL REMEMBRANCES */}
          <section>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Kunlik Adhkar
            </p>

            <div className="space-y-3">
              {/* Subhanallah */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-emerald-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-emerald-600" />
                    <p className="font-semibold text-gray-800">Subhanallah</p>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">
                    33 marta
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Xudoning pak va munazzah ekanligini tasbih qiling
                </p>
                <Link href="/adhkar/subhanallah">
                  <Button
                    size="sm"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full h-9 text-xs font-medium"
                  >
                    Boshlash
                  </Button>
                </Link>
              </div>

              {/* Alhamdulillah */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-cyan-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-600" />
                    <p className="font-semibold text-gray-800">Alhamdulillah</p>
                  </div>
                  <span className="text-xs font-medium text-cyan-600">
                    33 marta
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Baxshi va niimatlar uchun Xudoga shukr ayting
                </p>
                <Link href="/adhkar/alhamdulillah">
                  <Button
                    size="sm"
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-full h-9 text-xs font-medium"
                  >
                    Boshlash
                  </Button>
                </Link>
              </div>

              {/* Allahu Akbar */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 border border-blue-100/50 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-blue-600" />
                    <p className="font-semibold text-gray-800">Allahu Akbar</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    34 marta
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Xudoning ulug'ligi va buyukligi kabi ekanligini elon qiling
                </p>
                <Link href="/adhkar/allahuakbar">
                  <Button
                    size="sm"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full h-9 text-xs font-medium"
                  >
                    Boshlash
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* 4. Auth CTA (if not authenticated) */}
          {!isAuthenticated && (
            <section className="pb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Tavba yo'lida boshlang
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Ro'yxatdan o'ting va islomiy bilim oqalingarini boshlayin
                </p>

                <div className="space-y-3">
                  <Link
                    href={
                      isTelegram ? "/auth/telegram-register" : "/auth/register"
                    }
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-11 font-semibold">
                      Ro'yxatdan o'tish
                    </Button>
                  </Link>

                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full h-11 font-semibold"
                    >
                      Kirish
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Bottom spacing for Telegram safe area */}
          {isAuthenticated && <div className="h-6" />}
        </main>
      </div>
    </div>
  );
}
