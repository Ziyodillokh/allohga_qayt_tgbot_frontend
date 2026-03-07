"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { categoriesApi } from "@/lib/api";
import ChatbotQA from "@/components/test/ChatbotQA";
import {
  BookOpen,
  Play,
  Loader2,
  Sparkles,
  Trophy,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
  Zap,
  Target,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  _count?: {
    questions: number;
    testAttempts: number;
  };
}

export default function TestPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchCategories();
  }, [isAuthenticated, authLoading, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Agar kategoriya tanlangan bo'lsa — ChatbotQA ko'rsatamiz
  if (activeCategory) {
    const activeCat = categories.find((c) => c.slug === activeCategory);
    return (
      <ChatbotQA
        category={activeCategory}
        categoryName={
          activeCategory === "aralash" ? "Aralash test" : activeCat?.name
        }
        onClose={() => setActiveCategory(null)}
      />
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#D4AF37]/70 text-sm font-medium">
            Kategoriyalar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0D0A] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-gradient-radial from-[#D4AF37]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[250px] h-[250px] bg-gradient-radial from-[#AA8232]/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 rounded-xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-[#FBF0B2] tracking-tight">
              Bilim Testlari
            </h1>
            <p className="text-[#9A8866] text-xs mt-0.5">
              Kategoriyani tanlang — bot sizga savollar beradi
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <Target className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#D4AF37]">+1 XP</span>
          </div>
        </div>

        {/* Info card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#1E1C18] to-[#1E1C18]/60 border border-[#D4AF37]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-[11px] text-[#9A8866] leading-relaxed">
              Har bir to&apos;g&apos;ri javob uchun{" "}
              <span className="text-[#D4AF37] font-bold">1 XP</span> beriladi.
              10 ta savoldan iborat test yechib, bilimingizni sinang!
            </p>
          </div>
        </div>

        {/* Aralash test Banner */}
        <button
          onClick={() => setActiveCategory("aralash")}
          className="w-full mb-5 p-5 rounded-2xl bg-gradient-to-br from-[#D4AF37]/15 via-[#FBF0B2]/8 to-[#D4AF37]/5 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/10">
                <Sparkles className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <div className="text-left">
                <h3 className="text-[#FBF0B2] font-black text-base tracking-tight">
                  Aralash test
                </h3>
                <p className="text-[#9A8866] text-xs mt-0.5">
                  Barcha kategoriyalardan savollar
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
              <Play className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </button>

        {/* Section title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-[#D4AF37]/10" />
          <span className="text-[10px] font-bold text-[#9A8866] uppercase tracking-[0.2em]">
            Kategoriyalar
          </span>
          <div className="h-px flex-1 bg-[#D4AF37]/10" />
        </div>

        {/* Categories Grid */}
        <div className="space-y-3">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className="w-full p-4 rounded-2xl bg-[#1E1C18]/60 border border-white/[0.06] hover:border-[#D4AF37]/25 hover:bg-[#1E1C18]/80 transition-all group text-left active:scale-[0.98]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Category icon */}
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md"
                  style={{
                    backgroundColor: category.color || "#6366f1",
                    width: "52px",
                    height: "52px",
                  }}
                >
                  {category.icon ? (
                    <span className="text-xl">{category.icon}</span>
                  ) : (
                    <span className="text-lg">
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Category info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#FBF0B2] font-bold text-[15px] truncate">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[#9A8866]/60 text-xs mt-0.5 line-clamp-1">
                      {category.description}
                    </p>
                  )}
                  {category._count && (
                    <div className="flex items-center gap-2.5 mt-2">
                      <span className="text-[10px] text-[#D4AF37]/50 bg-[#D4AF37]/8 px-2.5 py-1 rounded-full font-medium">
                        📝 {category._count.questions} savol
                      </span>
                      {category._count.testAttempts > 0 && (
                        <span className="text-[10px] text-[#22c55e]/60 bg-[#22c55e]/8 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                          <Trophy className="w-2.5 h-2.5" />
                          {category._count.testAttempts} urinish
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="w-9 h-9 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-[#1E1C18] border border-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-[#D4AF37]/20" />
            </div>
            <p className="text-[#9A8866] text-sm font-medium">
              Hozircha kategoriyalar mavjud emas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
