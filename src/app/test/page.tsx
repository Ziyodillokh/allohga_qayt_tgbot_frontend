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
        categoryName={activeCategory === "aralash" ? "Aralash test" : activeCat?.name}
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
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
          <MessageCircle className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h1 className="text-2xl font-bold text-[#FBF0B2] mb-2">
          Bilim Testlari
        </h1>
        <p className="text-[#D4AF37]/60 text-sm">
          Kategoriyani tanlang — bot sizga savollar beradi
        </p>
      </div>

      {/* Aralash test Banner */}
      <button
        onClick={() => setActiveCategory("aralash")}
        className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/15 to-[#FBF0B2]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div className="text-left">
              <h3 className="text-[#FBF0B2] font-bold text-base">
                Aralash test
              </h3>
              <p className="text-[#D4AF37]/50 text-xs mt-0.5">
                Barcha kategoriyalardan savollar
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#D4AF37]/40 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
        </div>
      </button>

      {/* Categories Grid */}
      <div className="space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.slug)}
            className="w-full p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-[#D4AF37]/30 hover:bg-white/[0.06] transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              {/* Category icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: category.color || "#6366f1" }}
              >
                {category.icon ? (
                  <span>{category.icon}</span>
                ) : (
                  category.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Category info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[#FBF0B2] font-semibold text-[15px] truncate">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-[#D4AF37]/40 text-xs mt-0.5 line-clamp-1">
                    {category.description}
                  </p>
                )}
                {category._count && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-[#D4AF37]/30 bg-[#D4AF37]/5 px-2 py-0.5 rounded-full">
                      {category._count.questions} savol
                    </span>
                    {category._count.testAttempts > 0 && (
                      <span className="text-[10px] text-[#D4AF37]/30 flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" />
                        {category._count.testAttempts} urinish
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <Play className="w-5 h-5 text-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-[#D4AF37]/20 mx-auto mb-4" />
          <p className="text-[#D4AF37]/40 text-sm">
            Hozircha kategoriyalar mavjud emas
          </p>
        </div>
      )}
    </div>
  );
}
