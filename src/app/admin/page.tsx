"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import Link from "next/link";

interface DashboardStats {
  users: { total: number; today: number; thisWeek: number };
  tests: { total: number; today: number; averageScore: number };
  questions: number;
  categories: number;
  aiChats: { total: number; today: number };
  topCategories: Array<{ id: string; name: string; testsCount: number }>;
  lowQuestionCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    totalQuestions: number;
    usedQuestions: number;
    unusedQuestions: number;
    questionsCount: number;
    needed: number;
  }>;
}

interface CategoryStat {
  id: string;
  name: string;
  questionCount?: number;
  questionsCount?: number;
  testCount?: number;
  testsCount?: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, catRes] = await Promise.all([
        fetch(`${API}/admin/dashboard/extended`, { headers }),
        fetch(`${API}/categories`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  // Real-time yangilanish - har 30 sekundda
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchData(false); // loading ko'rsatmasdan yangilash
    }, 30000); // 30 sekund

    return () => clearInterval(interval);
  }, [token]);

  // Use lowQuestionCategories from extended API (shows UNUSED questions)
  const lowQuestionCategories =
    stats?.lowQuestionCategories ||
    categories
      .filter((c) => (c.questionsCount ?? c.questionCount ?? 0) < 300)
      .sort(
        (a, b) =>
          (a.questionsCount ?? a.questionCount ?? 0) -
          (b.questionsCount ?? b.questionCount ?? 0)
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: "",
        totalQuestions: c.questionsCount ?? c.questionCount ?? 0,
        usedQuestions: 0,
        unusedQuestions: c.questionsCount ?? c.questionCount ?? 0,
        questionsCount: c.questionsCount ?? c.questionCount ?? 0,
        needed: 300 - (c.questionsCount ?? c.questionCount ?? 0),
      }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lastUpdated && (
            <span>Yangilangan: {lastUpdated.toLocaleTimeString("uz-UZ")}</span>
          )}
        </div>
        <button
          onClick={() => fetchData(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Yangilash
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Foydalanuvchilar"
          value={stats?.users?.total || 0}
          sub={`+${stats?.users?.today || 0} bugun`}
          color="blue"
          icon="users"
        />
        <StatCard
          title="Testlar"
          value={stats?.tests?.total || 0}
          sub={`+${stats?.tests?.today || 0} bugun`}
          color="emerald"
          icon="tests"
        />
        <StatCard
          title="Savollar"
          value={stats?.questions || 0}
          sub={`${stats?.categories || 0} kategoriya`}
          color="violet"
          icon="questions"
        />
        <StatCard
          title="Ortacha ball"
          value={`${(stats?.tests?.averageScore || 0).toFixed(0)}%`}
          sub="barcha testlar"
          color="amber"
          icon="chart"
        />
      </div>

      <div className="flex gap-2">
        <MiniStat
          value={stats?.aiChats?.total || 0}
          label="AI Chat"
          color="indigo"
        />
        <MiniStat
          value={stats?.users?.thisWeek || 0}
          label="Haftalik"
          color="green"
        />
        <MiniStat
          value={
            lowQuestionCategories.filter((c) => c.unusedQuestions < 300).length
          }
          label="Kam qolgan"
          color="pink"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Top Kategoriyalar
        </h3>
        <div className="space-y-2">
          {stats?.topCategories?.slice(0, 5).map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-yellow-400 text-yellow-900"
                      : i === 1
                      ? "bg-gray-300 text-gray-700"
                      : i === 2
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {i + 1}
                </span>
                <CategoryIcon name={cat.name} />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {cat.name}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {cat.testsCount} test
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Kam Qolgan Savollar
          </h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
            {
              lowQuestionCategories.filter((c) => c.unusedQuestions < 300)
                .length
            }{" "}
            ta
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Ishlatilmagan savollar soni (jami - ishlangan)
        </p>
        <div className="space-y-3">
          {lowQuestionCategories
            .filter((c) => c.unusedQuestions < 300)
            .slice(0, 6)
            .map((cat) => {
              const unusedCount = cat.unusedQuestions;
              const percent = Math.round((unusedCount / 300) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.name} />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {unusedCount}
                      </span>
                      <span className="text-xs text-gray-400">
                        /{cat.totalQuestions}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percent >= 70
                          ? "bg-green-500"
                          : percent >= 40
                          ? "bg-yellow-500"
                          : percent >= 15
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-xs text-gray-400">
                      {cat.usedQuestions} ta ishlangan
                    </span>
                    <span className="text-xs text-red-500 font-medium">
                      {unusedCount < 300 ? `-${300 - unusedCount} kerak` : "✓"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <QuickLink
          href="/admin/categories"
          label="Kategoriya"
          color="blue"
          icon="folder"
        />
        <QuickLink
          href="/admin/users"
          label="Userlar"
          color="green"
          icon="users"
        />
        <QuickLink
          href="/admin/messages"
          label="Xabarlar"
          color="purple"
          icon="chat"
        />
        <QuickLink
          href="/admin/design"
          label="Dizayn"
          color="orange"
          icon="paint"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: number | string;
  sub: string;
  color: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
  };
  const icons: Record<string, JSX.Element> = {
    users: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    tests: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    questions: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    chart: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  };
  return (
    <div className={`${colors[color]} rounded-2xl p-4 text-white`}>
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
        {icons[icon]}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{title}</p>
      <p className="text-xs opacity-60 mt-1">{sub}</p>
    </div>
  );
}

function MiniStat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    pink: "text-pink-600",
  };
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  color,
  icon,
}: {
  href: string;
  label: string;
  color: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300",
  };
  const icons: Record<string, JSX.Element> = {
    folder: (
      <svg
        className="w-5 h-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
    users: (
      <svg
        className="w-5 h-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    chat: (
      <svg
        className="w-5 h-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    paint: (
      <svg
        className="w-5 h-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
  };
  return (
    <Link
      href={href}
      className={`${colors[color]} rounded-xl p-3 text-center transition hover:opacity-80`}
    >
      {icons[icon]}
      <p className="text-xs font-medium mt-1">{label}</p>
    </Link>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const n = name.toLowerCase();

  const getLogoPath = (): string | null => {
    if (n.includes("javascript") && !n.includes("typescript"))
      return "/img/JavaScript-logo.png";
    if (n.includes("typescript")) return "/img/TypeScript-logo.png";
    if (n.includes("python")) return "/img/Python-logo.png";
    if (n.includes("java") && !n.includes("javascript"))
      return "/img/Java-logo.png";
    if (n.includes("c++") || n.includes("cpp")) return "/img/c++-logo.png";
    if (n.includes("go") || n.includes("golang"))
      return "/img/Go-Logo_Aqua.png";
    if (n.includes("rust")) return "/img/rust-logo.png";
    if (n.includes("react")) return "/img/react-logo.png";
    if (n.includes("next")) return "/img/next.js-logo.png";
    if (n.includes("vue")) return "/img/vue.js-logo.png";
    if (n.includes("node")) return "/img/node.js-logo.png";
    if (n.includes("express")) return "/img/express.js-logo.png";
    if (n.includes("nest")) return "/img/nestjs-logo.png";
    if (n.includes("django")) return "/img/django-logo.png";
    if (n.includes("postgresql") || n.includes("postgres"))
      return "/img/postgreSql-logo.png";
    if (n.includes("mongo")) return "/img/mongodb-logo.png";
    if (n.includes("redis")) return "/img/redis-logo.png";
    if (n.includes("sql") && !n.includes("postgresql") && !n.includes("mongo"))
      return "/img/sql-logo.png";
    if (n.includes("git") && !n.includes("github")) return "/img/git-logo.png";
    if (n.includes("linux")) return "/img/linux-logo.png";
    if (n.includes("html") || n.includes("css"))
      return "/img/html-css-logo.png";
    if (n.includes("tailwind")) return "/img/tailwind-css-logo.png";
    if (n.includes("matematika") || n.includes("math"))
      return "/img/matematika-logo.png";
    if (n.includes("fizika") || n.includes("physics"))
      return "/img/fizika-logo.png";
    if (n.includes("ingliz") || n.includes("english"))
      return "/img/english-logo.png";
    if (n.includes("tarix") || n.includes("history"))
      return "/img/history-logo.png";
    return null;
  };

  const logoPath = getLogoPath();

  if (logoPath) {
    return (
      <img
        src={logoPath}
        alt={name}
        className="w-5 h-5 object-contain rounded"
      />
    );
  }

  return (
    <span className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs">
      📚
    </span>
  );
}
