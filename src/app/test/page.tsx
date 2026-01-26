"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Trophy,
  Star,
  ArrowLeft,
} from "lucide-react";
import ChatbotQA from "@/components/test/ChatbotQA";
import { getCategoryIconUrl } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  questionsCount: number;
}

export default function TestPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.filter((c: Category) => c.questionsCount > 0));
      }
    } catch (error) {
      console.error("Categories fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showChatbot && selectedCategory) {
    return (
      <ChatbotQA
        category={selectedCategory}
        onClose={() => {
          setShowChatbot(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] relative overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-gradient-radial from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-gradient-radial from-[#AA8232]/15 via-[#AA8232]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-5 py-8 pb-32">
        {/* Header */}
        <header className="mb-10">
          <button
            onClick={() => router.back()}
            className="mb-6 p-3 rounded-2xl bg-[#1A1812]/60 border border-[#D4AF37]/10 backdrop-blur-xl hover:bg-[#1A1812] hover:border-[#D4AF37]/30 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                Test Markazi
              </span>
            </div>

            <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
              Bilimingizni Sinang
            </h1>

            <p className="text-[#9A8866] text-sm leading-relaxed max-w-[280px] mx-auto">
              Kategoriyani tanlang va savollar bilan bilimingizni tekshiring
            </p>
          </div>
        </header>

        {/* Stats Banner */}
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-br from-[#1A1812] to-[#0F0E0A] border border-[#D4AF37]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>

          <div className="relative flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#D4AF37]/10 mb-2 mx-auto">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-black text-white">
                {categories.length}
              </p>
              <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                Kategoriya
              </p>
            </div>

            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#D4AF37]/10 mb-2 mx-auto">
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-black text-white">
                {categories.reduce((acc, c) => acc + c.questionsCount, 0)}
              </p>
              <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                Savol
              </p>
            </div>

            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#D4AF37]/10 mb-2 mx-auto">
                <Star className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <p className="text-2xl font-black text-white">10</p>
              <p className="text-[10px] text-[#9A8866] uppercase tracking-wider">
                Har test
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#9A8866] uppercase tracking-[0.2em] mb-4 px-1">
            Kategoriyalar
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
              <p className="text-[#9A8866] text-sm">Yuklanmoqda...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 rounded-3xl bg-[#1A1812] border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-8 h-8 text-[#D4AF37]/50" />
              </div>
              <p className="text-[#9A8866] mb-2">
                Hozircha kategoriyalar mavjud emas
              </p>
              <p className="text-[#9A8866]/50 text-sm">Tez orada qo'shiladi!</p>
            </div>
          ) : (
            categories.map((cat, index) => {
              const iconPath = getCategoryIconUrl(cat.slug, cat.icon);
              const isImageIcon =
                iconPath &&
                (iconPath.startsWith("/uploads/") ||
                  iconPath.startsWith("/img/") ||
                  iconPath.startsWith("http") ||
                  iconPath.endsWith(".png") ||
                  iconPath.endsWith(".jpg") ||
                  iconPath.endsWith(".svg"));

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setShowChatbot(true);
                  }}
                  className="w-full group"
                >
                  <div className="p-4 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:bg-[#1A1812] transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {isImageIcon && iconPath ? (
                        <img
                          src={iconPath}
                          alt={cat.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : iconPath ? (
                        <span className="text-3xl">{iconPath}</span>
                      ) : (
                        <span className="text-xl font-black text-[#D4AF37]">
                          {cat.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#FBF0B2] transition-colors">
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9A8866]">
                          {cat.questionsCount} savol
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#D4AF37]/30"></span>
                        <span className="text-xs text-[#D4AF37]/70">
                          10 ta test
                        </span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                      <ChevronRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
