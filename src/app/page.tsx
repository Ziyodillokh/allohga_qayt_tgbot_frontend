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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatbotQA from "@/components/test/ChatbotQA";

const dailyZikrData = [
  {
    name: "Istig'for",
    count: 100,
    emoji: "🤲",
    arabicText: "أَسْتَغْفِرُ اللهَ",
    translation: "Astaghfirulloh",
    meaning: "Allohdan mag'firat so'rayman",
    benefit:
      "Kim istig'forni ko'paytirsa, Alloh unga har bir g'amdan chiqish yo'li beradi.",
  },
  {
    name: "Salovat",
    count: 50,
    emoji: "☪️",
    arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
    translation: "Allohumma solli 'ala Muhammad",
    meaning: "Allohim, Muhammadga salovat va baraka ber",
    benefit:
      "Sizga Alloh 10 marta salovat aytadi va 10 ta xatoyingiz o'chiriladi.",
  },
  {
    name: "Tasbih",
    count: 33,
    emoji: "✨",
    arabicText: "سُبْحَانَ اللهِ",
    translation: "Subhanalloh",
    meaning: "Alloh har qanday ayb va nuqsondan pokdir",
    benefit: "Jannatda siz uchun bir daraxt ekiladi va gunohlar to'kiladi.",
  },
  {
    name: "Hamd",
    count: 33,
    emoji: "🙏",
    arabicText: "الْحَمْدُ للهِ",
    translation: "Alhamdulillah",
    meaning: "Barcha hamd va maqtovlar Allohga xosdir",
    benefit:
      "Shukr qiluvchining ne'mati ziyoda bo'ladi va tarozi savobga to'ladi.",
  },
  {
    name: "Tahlil",
    count: 100,
    emoji: "☝️",
    arabicText: "لَا إِلَهَ إِلَّا اللهُ",
    translation: "La ilaha illalloh",
    meaning: "Allohdan boshqa iloh yo'q",
    benefit:
      "Zikrning eng afzali bo'lib, jannat kalitidir va imonni yangilaydi.",
  },
  {
    name: "Ixtiyoriy zikr",
    count: 100,
    emoji: "📿",
    arabicText: "ذِكْرُ اللهِ",
    translation: "Zikrulloh",
    meaning: "Allohni yod etish",
    benefit:
      "Ushbu bo'limda o'zingiz bilgan ixtiyoriy salovat, tasbih yoki duolarni o'qib, sanog'ini yuritishingiz mumkin.",
  },
];

export default function LuxuryZikrApp() {
  const [activeNav, setActiveNav] = useState("home");
  const router = useRouter();
  const [selectedZikr, setSelectedZikr] = useState<any | null>(null);
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Telegram ma'lumotlari uchun state'lar
  const [userName, setUserName] = useState("Aziz dindoshim");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const [showChatbotQA, setShowChatbotQA] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("quron");

  const categories = [
    { name: "quron", label: "Qur'on", emoji: "📖" },
    { name: "hadis", label: "Hadis", emoji: "📜" },
    { name: "aqida", label: "Aqida", emoji: "✨" },
    { name: "fiqh", label: "Fiqh", emoji: "⚖️" },
    { name: "seerat", label: "Seerat", emoji: "👤" },
    { name: "zikr", label: "Zikr & Duolar", emoji: "🤲" },
  ];

  // Telegram WebApp orqali foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      if (user) {
        setUserName(
          user.first_name + (user.last_name ? ` ${user.last_name}` : "")
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

  const handleCount = () => {
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
          "success"
        );
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
    <div
      className="fixed inset-0 bg-black flex justify-center overflow-hidden touch-none"
      style={{ overscrollBehaviorY: "contain" }}
    >
      <div className="w-full max-w-md bg-[#0F0E0A] text-[#E5C366] flex flex-col relative h-full shadow-2xl overflow-hidden border-x border-white/5">
        {/* Orqa fon nur effekti */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-[#D4AF37] rounded-full blur-[110px]"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-[#AA8232] rounded-full blur-[110px]"></div>
        </div>

        {/* --- MAIN CONTENT --- */}
        {activeNav === "home" ? (
          <>
            <header className="relative z-20 pt-8 px-6 pb-4 shrink-0 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[1.5px] shadow-lg overflow-hidden">
                <div className="w-full h-full rounded-full bg-[#0F0E0A] flex items-center justify-center overflow-hidden">
                  <img
                    src="/img/logotip.png"
                    alt="Logo"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
              </div>
              <div>
                <p className="text-[#FBF0B2]/60 text-[10px] font-black uppercase tracking-[0.3em]">
                  Assalomu alaykum
                </p>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {userName}
                </h1>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 pb-40 relative z-10 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#1A1812] border border-[#D4AF37]/20 p-6 rounded-3xl shadow-lg active:bg-[#26231A] transition-all flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-4xl">💡</span>
                  <p className="text-[8px] uppercase font-black text-[#D4AF37]/50 tracking-widest">
                    AI
                  </p>
                  <p className="text-xs font-bold text-[#FBF0B2] leading-tight">
                    Tavsiya
                  </p>
                </div>
                <button
                  onClick={() => setShowCategorySelect(true)}
                  className="bg-[#1A1812] border border-[#D4AF37]/20 p-6 rounded-3xl shadow-lg active:bg-[#26231A] transition-all flex flex-col items-center justify-center text-center gap-2"
                >
                  <span className="text-4xl">✨</span>
                  <p className="text-[8px] uppercase font-black text-[#D4AF37]/50 tracking-widest">
                    Bilim
                  </p>
                  <p className="text-xs font-bold text-[#FBF0B2] leading-tight">
                    Sinovi
                  </p>
                </button>
              </div>

              <div className="space-y-3">
                {dailyZikrData.map((zikr, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedZikr(zikr);
                      resetZikr();
                    }}
                    className="bg-[#1A1812] border border-[#D4AF37]/10 rounded-[24px] p-4 flex flex-col gap-2 active:bg-[#26231A] active:scale-[0.98] transition-all border-l-4 border-l-[#D4AF37]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl bg-black/40 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5">
                          {zikr.emoji}
                        </span>
                        <div>
                          <h3 className="text-white font-bold text-sm">
                            {zikr.name}
                          </h3>
                          <p className="text-[9px] text-[#D4AF37]/60 italic truncate max-w-[150px]">
                            {zikr.benefit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-white">
                          {zikr.count}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#D4AF37]/30" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </>
        ) : activeNav === "profile" ? (
          /* PROFIL UI QISMI - TELEGRAM MA'LUMOTLARI BILAN */
          <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
            <div className="pt-12 px-6 pb-32">
              <div className="flex flex-col items-center mb-8">
                {/* Rasm qismi - Agar telegram rasm bo'lsa uni ko'rsatadi, bo'lmasa ikonka */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-1 shadow-2xl mb-4 relative">
                  <div className="w-full h-full rounded-full bg-[#0F0E0A] flex items-center justify-center overflow-hidden">
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
                  <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0F0E0A]"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {userName}
                </h2>
                <p className="text-[#D4AF37] text-xs font-medium uppercase tracking-[0.2em]">
                  Foydalanuvchi
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#1A1812] border border-[#D4AF37]/10 p-5 rounded-3xl text-center">
                  <Trophy className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-2xl font-black text-white">1,240</p>
                  <p className="text-[10px] text-[#D4AF37]/60 uppercase font-bold tracking-tighter">
                    Jami Zikrlar
                  </p>
                </div>
                <div className="bg-[#1A1812] border border-[#D4AF37]/10 p-5 rounded-3xl text-center">
                  <Award className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-2xl font-black text-white">12</p>
                  <p className="text-[10px] text-[#D4AF37]/60 uppercase font-bold tracking-tighter">
                    Yutuqlar
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ProfileMenuItem icon={Settings} label="Sozlamalar" />
                <ProfileMenuItem icon={Calendar} label="Zikrlar tarixi" />
                <ProfileMenuItem icon={HelpCircle} label="Yordam markazi" />
                <div className="pt-4">
                  <button className="w-full bg-red-500/10 border border-red-500/20 py-4 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-bold text-sm active:scale-95 transition-all">
                    <LogOut className="w-5 h-5" />
                    Chiqish
                  </button>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#D4AF37]/40 uppercase tracking-widest text-xs">
              Tez kunda...
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F0E0A] border-t border-[#D4AF37]/20 px-6 py-3 flex justify-around items-center max-w-md mx-auto w-full">
          <NavItem
            icon={Home}
            label="Bosh"
            active={activeNav === "home"}
            onClick={() => setActiveNav("home")}
          />
          <NavItem
            icon={BookOpen}
            label="Kitoblar"
            active={activeNav === "books"}
            onClick={() => setActiveNav("books")}
          />
          <NavItem
            icon={Sparkles}
            label="AI"
            active={activeNav === "ai"}
            onClick={() => setActiveNav("ai")}
            isLarge={true}
          />
          <NavItem
            icon={HelpCircle}
            label="Savol"
            active={activeNav === "questions"}
            onClick={() => setShowCategorySelect(true)}
          />
          <NavItem
            icon={User}
            label="Profil"
            active={activeNav === "profile"}
            onClick={() => setActiveNav("profile")}
          />
        </nav>

        {/* MODALLAR QISMI (O'zgarishsiz qoldi) */}
        {selectedZikr && (
          <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
            <header className="flex justify-between items-center mb-4 shrink-0">
              <button
                onClick={closeZikr}
                className="p-2.5 bg-white/5 rounded-full border border-white/10"
              >
                <X className="w-6 h-6 text-[#FBF0B2]" />
              </button>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#FBF0B2]">
                Zikr rejimi
              </p>
              <div className="w-10"></div>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <div className="text-center w-full px-4 min-h-[160px] flex flex-col justify-center">
                <p
                  className={`text-4xl font-serif text-white mb-6 ${
                    isFinished ? "opacity-20 blur-sm" : "opacity-100"
                  }`}
                  style={{ direction: "rtl" }}
                >
                  {selectedZikr.arabicText}
                </p>
                {isFinished ? (
                  <div className="bg-[#D4AF37]/10 py-5 px-8 rounded-[32px] border border-[#FBF0B2]/20 animate-in zoom-in">
                    <CheckCircle2 className="w-8 h-8 text-[#FBF0B2] mx-auto mb-2" />
                    <h2 className="text-xl font-black text-white uppercase">
                      MashaAlloh!
                    </h2>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-lg text-[#FBF0B2] font-semibold italic uppercase">
                      "{selectedZikr.translation}"
                    </p>
                    <p className="text-[11px] text-[#FBF0B2]/50 uppercase">
                      {selectedZikr.benefit}
                    </p>
                  </div>
                )}
              </div>
              <div
                onClick={handleCount}
                className={`w-56 h-56 rounded-full relative flex items-center justify-center transition-all ${
                  isFinished ? "opacity-50" : "active:scale-95"
                }`}
              >
                <div className="relative text-center z-10">
                  {isFinished ? (
                    <Trophy className="w-12 h-12 text-[#FBF0B2] animate-bounce" />
                  ) : (
                    <>
                      <span className="text-8xl font-black text-white tabular-nums">
                        {count}
                      </span>
                      <p className="text-[#FBF0B2]/30 text-[9px] font-black uppercase tracking-[0.4em] mt-4">
                        Bosish
                      </p>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full border-[2px] border-white/5"></div>
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="transparent"
                    stroke="#D4AF37"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 92}
                    strokeDashoffset={
                      2 * Math.PI * 92 * (1 - count / selectedZikr.count)
                    }
                    className="transition-all duration-200"
                  />
                </svg>
              </div>
            </div>
            <footer className="grid grid-cols-2 gap-4 mt-auto pt-6 pb-10">
              <button
                onClick={resetZikr}
                className="py-5 bg-white/5 rounded-3xl text-[10px] font-black uppercase text-[#FBF0B2]"
              >
                Qayta boshlash
              </button>
              <button
                onClick={closeZikr}
                className="py-5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-3xl text-[10px] font-black uppercase"
              >
                {isFinished ? "Yangi Zikr" : "Tugatish"}
              </button>
            </footer>
          </div>
        )}

        {showCategorySelect && !showChatbotQA && (
          <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col p-6">
            <header className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowCategorySelect(false)}
                className="p-2.5 bg-white/5 rounded-full"
              >
                <X className="w-6 h-6 text-[#FBF0B2]" />
              </button>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#FBF0B2]">
                Kategoriya Tanlang
              </p>
              <div className="w-10"></div>
            </header>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setShowCategorySelect(false);
                    setShowChatbotQA(true);
                  }}
                  className="bg-[#1A1812] border border-[#D4AF37]/20 p-6 rounded-2xl flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <p className="text-sm font-bold text-[#FBF0B2]">
                    {cat.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {showChatbotQA && (
          <ChatbotQA
            category={selectedCategory}
            difficulty="easy"
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
      className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
        isLarge ? "scale-125" : ""
      } ${active ? "opacity-100 scale-105" : "opacity-40"}`}
    >
      <Icon
        className={`${isLarge ? "w-7 h-7" : "w-5 h-5"} ${
          active ? "text-[#FBF0B2]" : "text-[#D4AF37]"
        }`}
      />
      <span
        className={`${
          isLarge ? "text-[10px]" : "text-[9px]"
        } font-black uppercase tracking-tighter ${
          active ? "text-[#FBF0B2]" : "text-[#D4AF37]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ProfileMenuItem({ icon: Icon, label }: any) {
  return (
    <div className="w-full bg-[#1A1812] border border-[#D4AF37]/5 p-5 rounded-2xl flex items-center justify-between active:bg-[#26231A] transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <span className="text-white font-bold text-sm">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-[#D4AF37]/20" />
    </div>
  );
}
