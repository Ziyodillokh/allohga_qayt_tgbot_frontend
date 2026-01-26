"use client";

import {
  Home,
  BookOpen,
  User,
  Sparkles,
  Trophy,
  X,
  Search,
  Zap,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Settings,
  LogOut,
  Award,
  Calendar,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatbotQA from "@/components/test/ChatbotQA";
import { zikrApi } from "@/lib/api";

// Zikr type definition
interface Zikr {
  id: string;
  titleArabic: string;
  titleLatin: string;
  textArabic: string;
  textLatin: string;
  description: string | null;
  count: number;
  emoji: string;
  dayOfWeek: number;
  isRamadan: boolean;
  order: number;
  isActive: boolean;
  xpReward: number;
  isCompleted?: boolean;
}

export default function LuxuryZikrApp() {
  const [activeNav, setActiveNav] = useState("home");
  const router = useRouter();
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Zikrlar uchun state'lar
  const [dailyZikrs, setDailyZikrs] = useState<Zikr[]>([]);
  const [isLoadingZikrs, setIsLoadingZikrs] = useState(true);
  const [todayDayName, setTodayDayName] = useState("");

  // Telegram ma'lumotlari uchun state'lar
  const [userName, setUserName] = useState("Aziz dindoshim");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [showChatbotQA, setShowChatbotQA] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("quron");
  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpToast, setShowXpToast] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

  const categories = [
    { name: "quron", label: "Qur'on", emoji: "📖" },
    { name: "hadis", label: "Hadis", emoji: "📜" },
    { name: "aqida", label: "Aqida", emoji: "✨" },
    { name: "fiqh", label: "Fiqh", emoji: "⚖️" },
    { name: "seerat", label: "Seerat", emoji: "👤" },
    { name: "zikr", label: "Zikr & Duolar", emoji: "🤲" },
  ];

  // Hafta kunlari nomlari
  const weekDays = [
    "Yakshanba",
    "Dushanba",
    "Seshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
  ];

  // Bugungi zikrlarni olish
  useEffect(() => {
    const fetchTodayZikrs = async () => {
      setIsLoadingZikrs(true);
      try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        setTodayDayName(weekDays[dayOfWeek]);

        const response = await zikrApi.getToday();
        if (response.data && response.data.length > 0) {
          setDailyZikrs(response.data);
        } else {
          // Backend'da zikrlar yo'q
          setDailyZikrs([]);
        }
      } catch (error) {
        console.error("Zikrlarni olishda xatolik:", error);
        // Xatolik bo'lsa bo'sh array
        setDailyZikrs([]);
      } finally {
        setIsLoadingZikrs(false);
      }
    };

    fetchTodayZikrs();
  }, []);

  // Telegram WebApp orqali foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      if (user) {
        setUserName(
          user.first_name + (user.last_name ? ` ${user.last_name}` : ""),
        );
        setUserPhoto(user.photo_url || null); // Telegram taqdim etgan rasm URL
      }
      tg.expand();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (showChatbotQA) {
        document.body.setAttribute("data-chatbot-open", "true");
      } else {
        document.body.removeAttribute("data-chatbot-open");
      }
    }
  }, [showChatbotQA]);

  const handleCount = async () => {
    if (!selectedZikr || isFinished) return;
    if (count < selectedZikr.count - 1) {
      setCount((prev) => prev + 1);
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }
    } else {
      setCount(selectedZikr.count);
      setIsFinished(true);
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred(
          "success",
        );
      }

      // Zikrni bajarish va XP olish
      try {
        const response = await zikrApi.complete(selectedZikr.id);
        if (response.data?.xpEarned) {
          setEarnedXp(response.data.xpEarned);
          setShowXpToast(true);
          setTimeout(() => setShowXpToast(false), 3000);

          // Zikrlar ro'yxatini yangilash
          setDailyZikrs((prev) =>
            prev.map((z) =>
              z.id === selectedZikr.id ? { ...z, isCompleted: true } : z,
            ),
          );
        }
      } catch (error) {
        console.log("Zikr bajarish xatosi:", error);
        // Xatolik bo'lsa ham UI ni davom ettirish
      }
    }
  };

  const resetZikr = () => {
    setCount(0);
    setIsFinished(false);
  };

  const closeZikr = () => {
    setSelectedZikr(null);
    resetZikr();
  };

  return (
    <div className="min-h-screen bg-[#0A0908] relative">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] bg-gradient-radial from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] bg-gradient-radial from-[#AA8232]/10 via-transparent to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto min-h-screen">
        {/* --- MAIN CONTENT --- */}
        {activeNav === "home" ? (
          <>
            {/* Header */}
            <header className="relative z-20 pt-12 px-5 pb-8">
              <div className="flex items-center gap-3">
                {/* Logo - Dumaloq */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[2px] shadow-lg shadow-[#D4AF37]/30">
                  <div className="w-full h-full rounded-full bg-[#0A0908] flex items-center justify-center overflow-hidden">
                    <img
                      src="/img/logotip.png"
                      alt="Tavba"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[#9A8866] text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Assalomu alaykum
                  </p>
                  <h1 className="text-lg font-bold text-white">{userName}</h1>
                </div>
                {/* Sozlamalar tugmasi */}
                <button
                  onClick={() => router.push("/profile")}
                  className="w-10 h-10 rounded-full bg-[#1A1812] border border-[#D4AF37]/20 flex items-center justify-center hover:border-[#D4AF37]/50 hover:bg-[#1A1812]/80 transition-all active:scale-95"
                >
                  <Settings className="w-5 h-5 text-[#D4AF37]/70" />
                </button>
              </div>
            </header>

            <main className="px-5 pb-32">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => router.push("/ai")}
                  className="group p-5 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-[10px] text-[#9A8866] uppercase tracking-wider mb-1">
                    AI Yordamchi
                  </p>
                  <p className="text-base font-bold text-white">Savol bering</p>
                </button>

                <button
                  onClick={() => router.push("/test")}
                  className="group p-5 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-[10px] text-[#9A8866] uppercase tracking-wider mb-1">
                    Test
                  </p>
                  <p className="text-base font-bold text-white">Bilim sinovi</p>
                </button>
              </div>

              {/* Daily Zikrs Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Bugungi zikrlar
                    </h2>
                    <p className="text-xs text-[#9A8866]">
                      {todayDayName} • {dailyZikrs.length} ta
                    </p>
                  </div>
                </div>

                {/* Loading holati */}
                {isLoadingZikrs ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-12 h-12 border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#9A8866] text-sm mt-4">
                      Yuklanmoqda...
                    </p>
                  </div>
                ) : dailyZikrs.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="w-20 h-20 rounded-3xl bg-[#1A1812] border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-5">
                      <span className="text-4xl">🤲</span>
                    </div>
                    <p className="text-[#9A8866]">
                      Bugun uchun zikrlar topilmadi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailyZikrs.map((zikr, index) => (
                      <button
                        key={zikr.id}
                        onClick={() => {
                          if (!zikr.isCompleted) {
                            setSelectedZikr(zikr);
                            resetZikr();
                          }
                        }}
                        disabled={zikr.isCompleted}
                        className="w-full group"
                      >
                        <div
                          className={`p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 ${
                            zikr.isCompleted
                              ? "bg-[#0F1A0F] border border-green-500/20"
                              : "bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:bg-[#1A1812] hover:border-[#D4AF37]/25 active:scale-[0.99]"
                          }`}
                        >
                          {/* Emoji Icon */}
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              zikr.isCompleted
                                ? "bg-green-500/15"
                                : "bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5"
                            }`}
                          >
                            {zikr.isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-400" />
                            ) : (
                              <span className="text-2xl">{zikr.emoji}</span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 text-left min-w-0">
                            <h3
                              className={`text-base font-bold truncate mb-1 ${
                                zikr.isCompleted
                                  ? "text-green-400/80"
                                  : "text-white"
                              }`}
                            >
                              {zikr.titleLatin}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-[#9A8866]">
                                {zikr.count} marta
                              </span>
                              <span className="text-xs text-[#D4AF37]/70 flex items-center gap-1 bg-[#D4AF37]/10 px-2 py-0.5 rounded-full">
                                <Zap className="w-3 h-3" />+{zikr.xpReward || 1}{" "}
                                XP
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          {!zikr.isCompleted && (
                            <ChevronRight className="w-5 h-5 text-[#D4AF37]/40 group-hover:text-[#D4AF37] transition-colors flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </>
        ) : activeNav === "profile" ? (
          /* PROFIL UI QISMI - PROFESSIONAL DIZAYN */
          <main className="px-6 pt-14 pb-32">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[3px] shadow-2xl shadow-[#D4AF37]/20 mb-5 relative">
                <div className="w-full h-full rounded-3xl bg-[#0A0908] flex items-center justify-center overflow-hidden">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-14 h-14 text-[#D4AF37]" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-green-400 to-green-600 w-7 h-7 rounded-xl border-4 border-[#0A0908] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                {userName}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                  Premium Foydalanuvchi
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1812] to-[#0F0E0A] border border-[#D4AF37]/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-3xl font-black text-white mb-1">1,240</p>
                  <p className="text-[10px] text-[#9A8866] uppercase font-bold tracking-wider">
                    Jami Zikrlar
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1812] to-[#0F0E0A] border border-[#D4AF37]/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-3xl font-black text-white mb-1">12</p>
                  <p className="text-[10px] text-[#9A8866] uppercase font-bold tracking-wider">
                    Yutuqlar
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
              <ProfileMenuItem
                icon={Settings}
                label="Sozlamalar"
                onClick={() => {}}
              />
              <ProfileMenuItem
                icon={Calendar}
                label="Zikrlar tarixi"
                onClick={() => {}}
              />
              <ProfileMenuItem
                icon={Trophy}
                label="Yutuqlarim"
                onClick={() => router.push("/achievements")}
              />
              <ProfileMenuItem
                icon={HelpCircle}
                label="Yordam markazi"
                onClick={() => {}}
              />

              <div className="pt-4">
                <button className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-500/20 transition-colors active:scale-[0.98]">
                  <LogOut className="w-5 h-5" />
                  Chiqish
                </button>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center pt-20">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#1A1812] border border-[#D4AF37]/20 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-[#D4AF37]/50" />
              </div>
              <p className="text-[#9A8866] uppercase tracking-widest text-xs">
                Tez kunda...
              </p>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
          <div className="mx-4 mb-6 px-4 py-3 rounded-3xl bg-[#1A1812]/95 backdrop-blur-xl border border-[#D4AF37]/20 shadow-2xl shadow-black/50">
            <div className="flex justify-around items-center">
              <NavItem
                icon={Home}
                label="Bosh sahifa"
                active={activeNav === "home"}
                onClick={() => setActiveNav("home")}
              />
              <NavItem
                icon={BookOpen}
                label="Kitoblar"
                active={activeNav === "books"}
                onClick={() => setShowComingSoon("Kitoblar")}
              />
              <NavItem
                icon={Sparkles}
                label="AI tavsiya"
                active={activeNav === "ai"}
                onClick={() => router.push("/ai")}
                isLarge={true}
              />
              <NavItem
                icon={HelpCircle}
                label="Testlar"
                active={activeNav === "tests"}
                onClick={() => router.push("/test")}
              />
              <NavItem
                icon={User}
                label="Profil"
                active={activeNav === "profile"}
                onClick={() => router.push("/profile")}
              />
            </div>
          </div>
        </nav>

        {/* Coming Soon Modal */}
        {showComingSoon && (
          <div
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
            onClick={() => setShowComingSoon(null)}
          >
            <div
              className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {showComingSoon}
              </h3>
              <p className="text-[#9A8866] mb-6">
                Bu bo'lim tez orada ishga tushadi. Bizni kuzatib boring!
              </p>
              <button
                onClick={() => setShowComingSoon(null)}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black font-bold rounded-2xl active:scale-[0.98] transition-transform"
              >
                Tushundim
              </button>
            </div>
          </div>
        )}

        {/* XP Toast */}
        {showXpToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#AA8232] px-8 py-4 rounded-2xl shadow-2xl shadow-[#D4AF37]/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#0A0908]" />
              </div>
              <div>
                <p className="text-lg font-black text-[#0A0908]">
                  +{earnedXp} XP
                </p>
                <p className="text-xs text-[#0A0908]/70">Zikr uchun mukofot!</p>
              </div>
            </div>
          </div>
        )}

        {/* Zikr Modal */}
        {selectedZikr && (
          <div className="fixed inset-0 z-[100] bg-[#0A0908] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <header className="relative z-10 flex justify-between items-center px-6 pt-14 pb-6">
              <button
                onClick={closeZikr}
                className="p-3 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-colors"
              >
                <X className="w-5 h-5 text-[#D4AF37]" />
              </button>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                  Zikr Rejimi
                </span>
              </div>
              <div className="w-12"></div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
              {/* Arabic text */}
              <div className="text-center w-full max-w-sm mb-8">
                <p
                  className={`text-4xl md:text-5xl font-serif text-white mb-6 leading-relaxed transition-all ${isFinished ? "opacity-20 blur-sm" : ""}`}
                  style={{ direction: "rtl" }}
                >
                  {selectedZikr.textArabic}
                </p>

                {isFinished ? (
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 animate-in zoom-in">
                    <CheckCircle2 className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                      MashaAlloh!
                    </h2>
                    <p className="text-[#9A8866] text-sm mt-2">
                      Zikr muvaffaqiyatli yakunlandi
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-[#FBF0B2] font-semibold italic mb-2">
                      "{selectedZikr.textLatin}"
                    </p>
                    <p className="text-xs text-[#9A8866]">
                      {selectedZikr.description || selectedZikr.titleLatin}
                    </p>
                  </div>
                )}
              </div>

              {/* Counter */}
              <div
                onClick={handleCount}
                className={`w-64 h-64 rounded-full relative flex items-center justify-center cursor-pointer select-none transition-all ${isFinished ? "opacity-50" : "active:scale-95"}`}
              >
                <div className="relative text-center z-10">
                  {isFinished ? (
                    <Trophy className="w-16 h-16 text-[#D4AF37] animate-bounce" />
                  ) : (
                    <>
                      <span className="text-8xl font-black text-white tabular-nums">
                        {count}
                      </span>
                      <p className="text-[#9A8866] text-xs font-bold uppercase tracking-[0.3em] mt-4">
                        Bosing
                      </p>
                    </>
                  )}
                </div>

                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[#1A1812]"></div>

                {/* Progress circle */}
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="transparent"
                    stroke="url(#goldGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 92}
                    strokeDashoffset={
                      2 * Math.PI * 92 * (1 - count / selectedZikr.count)
                    }
                    className="transition-all duration-200"
                  />
                  <defs>
                    <linearGradient
                      id="goldGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FBF0B2" />
                      <stop offset="50%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#AA8232" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <footer className="relative z-10 px-6 pb-10 pt-6">
              <div className="flex gap-4 max-w-sm mx-auto">
                <button
                  onClick={resetZikr}
                  className="flex-1 py-4 rounded-2xl bg-[#1A1812] border border-[#D4AF37]/20 text-[#D4AF37] font-bold text-sm uppercase tracking-wider hover:bg-[#26231A] transition-colors active:scale-[0.98]"
                >
                  Qayta boshlash
                </button>
                <button
                  onClick={closeZikr}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-[#D4AF37]/30 active:scale-[0.98]"
                >
                  {isFinished ? "Yangi Zikr" : "Tugatish"}
                </button>
              </div>
            </footer>
          </div>
        )}

        {/* Category Select Modal */}
        {showCategorySelect && !showChatbotQA && (
          <div className="fixed inset-0 z-[100] bg-[#0A0908] flex flex-col animate-in fade-in duration-200">
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#D4AF37]/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <header className="relative z-10 flex justify-between items-center px-6 pt-14 pb-6">
              <button
                onClick={() => setShowCategorySelect(false)}
                className="p-3 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10"
              >
                <X className="w-5 h-5 text-[#D4AF37]" />
              </button>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.15em]">
                  Kategoriya
                </span>
              </div>
              <div className="w-12"></div>
            </header>

            <div className="flex-1 px-6 pb-10 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">
                  Kategoriya Tanlang
                </h2>
                <p className="text-[#9A8866] text-sm">
                  Qaysi mavzuda test topshirmoqchisiz?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {categories.map((cat, index) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setShowCategorySelect(false);
                      setShowChatbotQA(true);
                    }}
                    className="group p-6 rounded-3xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:bg-[#1A1812] transition-all flex flex-col items-center gap-3"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-3xl">{cat.emoji}</span>
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-[#FBF0B2] transition-colors">
                      {cat.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showChatbotQA && (
          <ChatbotQA
            category={selectedCategory}
            onClose={() => setShowChatbotQA(false)}
          />
        )}
      </div>
    </div>
  );
}

// Yordamchi komponentlar
function NavItem({ icon: Icon, label, active, onClick, isLarge }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-all active:scale-90"
    >
      {isLarge ? (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            active
              ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] shadow-lg shadow-[#D4AF37]/40"
              : "bg-[#D4AF37]/20 border-2 border-[#D4AF37]/30"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${active ? "text-black" : "text-[#D4AF37]"}`}
          />
        </div>
      ) : (
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            active
              ? "bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 border border-[#D4AF37]/50"
              : "bg-[#1A1812] border border-[#D4AF37]/10"
          }`}
        >
          <Icon
            className={`w-5 h-5 transition-colors ${active ? "text-[#D4AF37]" : "text-[#9A8866]"}`}
          />
        </div>
      )}
      <span
        className={`text-[9px] font-semibold transition-colors ${
          active ? "text-[#D4AF37]" : "text-[#9A8866]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ProfileMenuItem({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 hover:bg-[#1A1812] transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <span className="text-white font-bold text-sm group-hover:text-[#FBF0B2] transition-colors">
          {label}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-[#D4AF37]/30 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
    </button>
  );
}
