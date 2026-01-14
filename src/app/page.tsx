"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Trophy,
  Bot,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth, useCategories, useStats } from "@/hooks";
import { Button, Card, Avatar, Progress, Badge } from "@/components/ui";
import {
  formatXP,
  calculateLevelProgress,
  cn,
  getCategoryIconUrl,
} from "@/lib/utils";
import { isTelegramWebApp } from "@/lib/telegram";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { stats, loading: statsLoading } = useStats();
  const isTelegram = isTelegramWebApp();

  // Faqat 6 ta ommabop kategoriya - bosh sahifa uchun
  const popularCategories = [
    { id: "1", name: "Python", slug: "python", logo: "/img/Python-logo.png" },
    {
      id: "2",
      name: "JavaScript",
      slug: "javascript",
      logo: "/img/JavaScript-logo.png",
    },
    { id: "3", name: "React", slug: "react", logo: "/img/react-logo.png" },
    {
      id: "4",
      name: "TypeScript",
      slug: "typescript",
      logo: "/img/TypeScript-logo.png",
    },
    { id: "5", name: "Java", slug: "java", logo: "/img/Java-logo.png" },
    { id: "6", name: "Node.js", slug: "nodejs", logo: "/img/node.js-logo.png" },
  ];

  // Faqat 6 ta ko'rsat
  const displayCategories = popularCategories;

  // Calculate real statistics from categories
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + (cat._count?.questions || 0),
    0
  );
  const totalCategories = categories.length || 30;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-500 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bilimingizni sinang va{" "}
              <span className="text-yellow-300">rivojlaning</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Test topshiring, XP to'plang, reytingda raqobatlashing va AI
              yordamchisidan foydalaning. 30+ kategoriya va minglab savollar
              sizni kutmoqda!
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link href="/categories">
                  <Button
                    size="lg"
                    className="bg-white text-teal-600 hover:bg-gray-100"
                  >
                    Test boshlash <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href={
                      isTelegram ? "/auth/telegram-register" : "/auth/register"
                    }
                  >
                    <Button
                      size="lg"
                      className="bg-white text-teal-600 hover:bg-gray-100"
                    >
                      Boshlash <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Kirish
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              {
                icon: Users,
                value: stats?.users?.toLocaleString() || "2",
                label: "Foydalanuvchilar",
              },
              {
                icon: Target,
                value:
                  totalQuestions > 0
                    ? totalQuestions.toLocaleString()
                    : "10,386",
                label: "Savollar",
              },
              {
                icon: Trophy,
                value: totalCategories > 0 ? totalCategories.toString() : "27",
                label: "Kategoriyalar",
              },
              {
                icon: TrendingUp,
                value:
                  totalCategories > 0 && totalQuestions > 0
                    ? Math.round(
                        totalQuestions / totalCategories
                      ).toLocaleString()
                    : "385",
                label: "O'rtacha savol/kategoriya",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Stats (if authenticated) */}
      {isAuthenticated && user && (
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6">
              <Avatar
                key={user.avatar || "no-avatar"}
                src={user.avatar}
                name={user.fullName}
                size="xl"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Salom, {user.fullName}! 👋
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  @{user.username} • Level {user.level}
                </p>
                <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Level {user.level} → {user.level + 1}
                    </span>
                    <span className="font-medium text-indigo-600">
                      {formatXP(user.totalXP)} XP
                    </span>
                  </div>
                  <Progress
                    value={calculateLevelProgress(user.totalXP).percentage}
                    variant="default"
                    size="md"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/categories">
                  <Button>
                    <Zap className="w-4 h-4 mr-2" />
                    Test boshlash
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Profil</Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Ommabob Kategoriyalar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Eng ko'p qo'llaniladigan kategoriyalar
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((category: any) => {
            const logo =
              category.logo || getCategoryIconUrl(category.slug, category.icon);
            return (
              <Link key={category.id} href={`/test/${category.slug}`}>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 border border-teal-100 dark:border-teal-800 cursor-pointer h-32 flex flex-col items-center justify-center">
                  <div className="flex justify-center mb-2 h-12">
                    {logo ? (
                      <img
                        src={logo}
                        alt={category.name}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center text-3xl rounded-lg w-12 h-12 bg-indigo-100 dark:bg-indigo-800">
                        📚
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {category.name}
                  </h3>
                  {category._count && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                      {category._count.questions}+ savol
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-8">
          <Link href="/categories">
            <Button
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              Barcha kategoriyalar <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 dark:bg-gray-900/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Nima uchun Bilimdon?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
              Platformamiz sizga bilimingizni samarali o'stirish uchun barcha
              zarur vositalarni taqdim etadi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Testlar va savollar",
                description:
                  "30+ kategoriya va minglab savollar. Har bir kategoriyada 10 ta random savol bilan test topshiring.",
                color: "bg-blue-500",
              },
              {
                icon: Zap,
                title: "XP va Level tizimi",
                description:
                  "Har bir to'g'ri javob uchun XP oling. Level ko'taring va yutuqlar qo'lga kiriting.",
                color: "bg-yellow-500",
              },
              {
                icon: Trophy,
                title: "Reyting tizimi",
                description:
                  "Boshqa foydalanuvchilar bilan raqobatlashing. Haftalik va oylik reytingda ishtirok eting.",
                color: "bg-green-500",
              },
              {
                icon: Bot,
                title: "AI Yordamchi",
                description:
                  "Bilimdon AI bilan suhbatlashing. Savollaringizga javob oling va bilimingizni oshiring.",
                color: "bg-purple-500",
              },
              {
                icon: TrendingUp,
                title: "Statistika",
                description:
                  "O'z progressingizni kuzating. Har bir kategoriya bo'yicha batafsil statistika.",
                color: "bg-pink-500",
              },
              {
                icon: Users,
                title: "Jamiyat",
                description:
                  "Minglab foydalanuvchilar bilan bir platformada. Birgalikda o'rganish yanada qiziqarli.",
                color: "bg-orange-500",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4",
                    feature.color
                  )}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Hoziroq boshlang!
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Ro'yxatdan o'ting va bilimingizni sinashni boshlang. Bepul va
              oson!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={isTelegram ? "/auth/telegram-register" : "/auth/register"}
              >
                <Button
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-gray-100"
                >
                  Ro'yxatdan o'tish
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Kategoriyalarni ko'rish
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
