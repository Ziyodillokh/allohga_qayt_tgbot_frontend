"use client";

import { useAdminSocket } from "@/contexts/AdminSocketContext";
import Link from "next/link";
import {
  Users,
  FileText,
  HelpCircle,
  TrendingUp,
  Bot,
  Sparkles,
  CheckCircle,
  Zap,
  FolderOpen,
  MessageSquare,
  ArrowUpRight,
  Activity,
  BarChart3,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { stats, loading, connected, lastUpdated, refresh } = useAdminSocket();

  const lowQuestionCategories = stats?.lowQuestionCategories || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#D4AF37]/60 text-sm">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FBF0B2]">
            Boshqaruv Paneli
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`}
              />
              <span className="text-xs text-[#D4AF37]/60">
                {connected ? "Jonli ulanish" : "Ulanmoqda..."}
              </span>
            </div>
            {lastUpdated && (
              <span className="text-xs text-[#D4AF37]/40">
                <Clock className="w-3 h-3 inline mr-1" />
                {lastUpdated.toLocaleTimeString("uz-UZ")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={!connected}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/10 disabled:opacity-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Foydalanuvchilar"
          value={stats?.users?.total || 0}
          change={`+${stats?.users?.today || 0}`}
          changeLabel="bugun"
          icon={Users}
          color="gold"
        />
        <StatCard
          title="Testlar"
          value={stats?.tests?.total || 0}
          change={`+${stats?.tests?.today || 0}`}
          changeLabel="bugun"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Savollar"
          value={stats?.questions || 0}
          change={`${stats?.categories || 0}`}
          changeLabel="kategoriya"
          icon={HelpCircle}
          color="purple"
        />
        <StatCard
          title="O'rtacha ball"
          value={`${Number(stats?.tests?.averageScore || 0).toFixed(0)}%`}
          change=""
          changeLabel="barcha testlar"
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <MiniStat
          value={stats?.aiChats?.total || 0}
          label="AI Chat"
          icon={Bot}
        />
        <MiniStat
          value={stats?.users?.thisWeek || 0}
          label="Haftalik"
          icon={Activity}
        />
        <MiniStat
          value={stats?.zikr?.total || 0}
          label="Zikrlar"
          icon={Sparkles}
        />
        <MiniStat
          value={stats?.zikr?.completions?.today || 0}
          label="Bugungi zikr"
          icon={CheckCircle}
        />
        <MiniStat
          value={stats?.correctAnswers?.total || 0}
          label="To'g'ri javob"
          icon={CheckCircle}
        />
        <MiniStat
          value={stats?.xp?.totalEarned || 0}
          label="Jami XP"
          icon={Zap}
        />
      </div>

      {/* Zikr Stats Section */}
      {stats?.zikr && (
        <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#0F0E0A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#FBF0B2]">
                  Zikr Statistikasi
                </h3>
                <p className="text-xs text-[#D4AF37]/60">
                  {stats.zikr.active} faol zikr
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full font-medium">
              Faol
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-[#0F0E0A] rounded-xl p-4 border border-[#D4AF37]/10">
              <p className="text-2xl font-bold text-[#FBF0B2]">
                {stats.zikr.completions.total.toLocaleString()}
              </p>
              <p className="text-xs text-[#D4AF37]/60 mt-1">Jami bajarilgan</p>
            </div>
            <div className="bg-[#0F0E0A] rounded-xl p-4 border border-[#D4AF37]/10">
              <p className="text-2xl font-bold text-green-400">
                +{stats.zikr.completions.today}
              </p>
              <p className="text-xs text-[#D4AF37]/60 mt-1">Bugun</p>
            </div>
            <div className="bg-[#0F0E0A] rounded-xl p-4 border border-[#D4AF37]/10">
              <p className="text-2xl font-bold text-blue-400">
                {stats.zikr.completions.thisWeek}
              </p>
              <p className="text-xs text-[#D4AF37]/60 mt-1">Bu hafta</p>
            </div>
            <div className="bg-[#0F0E0A] rounded-xl p-4 border border-[#D4AF37]/10">
              <p className="text-2xl font-bold text-[#D4AF37]">
                {stats.zikr.totalXpEarned.toLocaleString()}
              </p>
              <p className="text-xs text-[#D4AF37]/60 mt-1">XP olindi</p>
            </div>
          </div>

          {/* Top Zikrs */}
          {stats.zikr.topZikrs && stats.zikr.topZikrs.length > 0 && (
            <div>
              <p className="text-xs text-[#D4AF37]/60 mb-3 font-medium">
                Eng ko'p bajarilgan
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.zikr.topZikrs.slice(0, 5).map((z: any, i: number) => (
                  <div
                    key={z.id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      i === 0
                        ? "bg-gradient-to-r from-[#D4AF37]/20 to-[#AA8232]/20 border-[#D4AF37]/30"
                        : "bg-[#0F0E0A] border-[#D4AF37]/10"
                    }`}
                  >
                    <span className="text-lg">{z.emoji}</span>
                    <span className="text-sm font-medium text-[#E5C366]">
                      {z.title}
                    </span>
                    <span className="text-xs bg-[#1E1C18] text-[#D4AF37]/80 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                      {z.completions}Г—
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#0F0E0A]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#FBF0B2]">
                Top Kategoriyalar
              </h3>
              <p className="text-xs text-[#D4AF37]/60">
                Eng ko'p test yechilgan
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stats?.topCategories?.slice(0, 5).map((cat: any, i: number) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-[#0F0E0A] rounded-xl hover:bg-[#0F0E0A]/80 transition-colors border border-[#D4AF37]/10"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      i === 0
                        ? "bg-gradient-to-br from-[#FBF0B2] to-[#D4AF37] text-[#0F0E0A]"
                        : i === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
                          : i === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                            : "bg-[#1E1C18] text-[#D4AF37]/60"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-[#E5C366]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1.5 rounded-lg">
                  {cat.testsCount} test
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Question Categories */}
        <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#FBF0B2]">
                  Kam Qolgan Savollar
                </h3>
                <p className="text-xs text-[#D4AF37]/60">
                  Ishlatilmagan savollar
                </p>
              </div>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded-full font-medium">
              {
                lowQuestionCategories.filter(
                  (c: any) => c.unusedQuestions < 300,
                ).length
              }{" "}
              ta
            </span>
          </div>

          <div className="space-y-4">
            {lowQuestionCategories
              .filter((c: any) => c.unusedQuestions < 300)
              .slice(0, 5)
              .map((cat: any) => {
                const percent = Math.round((cat.unusedQuestions / 300) * 100);
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#E5C366]">
                        {cat.name}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#FBF0B2]">
                          {cat.unusedQuestions}
                        </span>
                        <span className="text-xs text-[#D4AF37]/40">
                          /{cat.totalQuestions}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-[#0F0E0A] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent >= 70
                            ? "bg-green-500"
                            : percent >= 40
                              ? "bg-amber-500"
                              : percent >= 15
                                ? "bg-orange-500"
                                : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-[#D4AF37]/40">
                        {cat.usedQuestions} ta ishlangan
                      </span>
                      <span
                        className={`text-xs font-medium ${percent < 50 ? "text-rose-400" : "text-green-400"}`}
                      >
                        {cat.unusedQuestions < 300
                          ? `${300 - cat.unusedQuestions} kerak`
                          : "вњ“"}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink
          href="/admin/categories"
          label="Kategoriyalar"
          icon={FolderOpen}
        />
        <QuickLink href="/admin/users" label="Foydalanuvchilar" icon={Users} />
        <QuickLink href="/admin/zikr" label="Zikrlar" icon={Sparkles} />
        <QuickLink
          href="/admin/messages"
          label="Xabarlar"
          icon={MessageSquare}
        />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  change: string;
  changeLabel: string;
  icon: any;
  color: "gold" | "blue" | "purple" | "green";
}) {
  const colorStyles = {
    gold: "from-[#FBF0B2] via-[#D4AF37] to-[#AA8232]",
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-green-600",
  };

  return (
    <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center mb-4`}
      >
        <Icon className="w-5 h-5 text-[#0F0E0A]" />
      </div>
      <p className="text-2xl font-bold text-[#FBF0B2]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-[#D4AF37]/70 font-medium">{title}</p>
      {change && (
        <p className="text-xs text-green-400 mt-1 font-medium">
          {change} <span className="text-[#D4AF37]/40">{changeLabel}</span>
        </p>
      )}
    </div>
  );
}

// Mini Stat Component
function MiniStat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: any;
}) {
  return (
    <div className="bg-[#1E1C18] border border-[#D4AF37]/20 rounded-xl p-4 text-center hover:border-[#D4AF37]/40 transition-colors">
      <Icon className="w-5 h-5 mx-auto text-[#D4AF37]/60 mb-2" />
      <p className="text-lg font-bold text-[#FBF0B2]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-[#D4AF37]/60">{label}</p>
    </div>
  );
}

// Quick Link Component
function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="group bg-[#1E1C18] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 rounded-2xl p-5 text-center transition-all"
    >
      <div className="w-12 h-12 mx-auto rounded-xl bg-[#0F0E0A] group-hover:bg-gradient-to-br group-hover:from-[#FBF0B2] group-hover:via-[#D4AF37] group-hover:to-[#AA8232] flex items-center justify-center mb-3 transition-all border border-[#D4AF37]/10 group-hover:border-transparent">
        <Icon className="w-6 h-6 text-[#D4AF37]/60 group-hover:text-[#0F0E0A] transition-colors" />
      </div>
      <p className="text-sm font-medium text-[#E5C366] group-hover:text-[#FBF0B2] transition-colors">
        {label}
      </p>
      <ArrowUpRight className="w-4 h-4 mx-auto mt-2 text-[#D4AF37]/30 group-hover:text-[#D4AF37]/60 transition-colors" />
    </Link>
  );
}
