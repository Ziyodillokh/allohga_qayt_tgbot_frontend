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
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";

// Zikrlar bazasi - Ishonchli manbalar asosida
const dailyZikrData = [
  {
    name: "Istig'for",
    count: 100,
    emoji: "🤲",
    arabicText: "أَسْتَغْفِرُ اللهَ", // Astaghfirullah
    translation: "Astaghfirulloh",
    meaning: "Allohdan mag'firat so'rayman",
    benefit:
      "Kim istig'forni ko'paytirsa, Alloh unga har bir g'amdan chiqish yo'li beradi.",
  },
  {
    name: "Salovat",
    count: 50,
    emoji: "☪️",
    arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", // Allahumma solli ala Muhammad
    translation: "Allohumma solli 'ala Muhammad",
    meaning: "Allohim, Muhammadga salovat va baraka ber",
    benefit:
      "Sizga Alloh 10 marta salovat aytadi va 10 ta xatoyingiz o'chiriladi.",
  },
  {
    name: "Tasbih",
    count: 33,
    emoji: "✨",
    arabicText: "سُبْحَانَ اللهِ", // SubhanAllah
    translation: "Subhanalloh",
    meaning: "Alloh har qanday ayb va nuqsondan pokdir",
    benefit: "Jannatda siz uchun bir daraxt ekiladi va gunohlar to'kiladi.",
  },
  {
    name: "Hamd",
    count: 33,
    emoji: "🙏",
    arabicText: "الْحَمْدُ للهِ", // Alhamdulillah
    translation: "Alhamdulillah",
    meaning: "Barcha hamd va maqtovlar Allohga xosdir",
    benefit:
      "Shukr qiluvchining ne'mati ziyoda bo'ladi va tarozi savobga to'ladi.",
  },
  {
    name: "Tahlil",
    count: 100,
    emoji: "☝️",
    arabicText: "لَا إِلَهَ إِلَّا اللهُ", // La ilaha illallah
    translation: "La ilaha illalloh",
    meaning: "Allohdan boshqa iloh (ibodatga loyiq zot) yo'q",
    benefit:
      "Zikrning eng afzali bo'lib, jannat kalitidir va imonni yangilaydi.",
  },
];

export default function LuxuryZikrApp() {
  const [activeNav, setActiveNav] = useState("home");
  const [selectedZikr, setSelectedZikr] = useState<any | null>(null);
  const [count, setCount] = useState(0);
  const [userName, setUserName] = useState("Aziz dindoshim");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      const name = tg.initDataUnsafe?.user?.first_name;
      if (name) setUserName(name);
      tg.expand();
    }
  }, []);

  const handleCount = () => {
    if (selectedZikr && count < selectedZikr.count) {
      setCount((prev) => prev + 1);
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black flex justify-center overflow-hidden touch-none selection:bg-transparent"
      style={{ overscrollBehaviorY: "contain" }}
    >
      <div className="w-full max-w-md bg-[#0F0E0A] text-[#E5C366] flex flex-col relative h-full shadow-2xl overflow-hidden border-x border-white/5">
        {/* Glow Effects */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-[#D4AF37] rounded-full blur-[110px]"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-[#AA8232] rounded-full blur-[110px]"></div>
        </div>

        {/* Header - Logo and Welcome */}
        <header className="relative z-20 pt-8 px-6 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <div className="w-full h-full rounded-full bg-[#0F0E0A] flex items-center justify-center">
                <Moon className="w-7 h-7 text-[#FBF0B2] fill-[#FBF0B2] -rotate-12" />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-[#FBF0B2]/60 text-[10px] font-black uppercase tracking-[0.3em] mb-0.5">
                Assalomu alaykum
              </p>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none uppercase">
                {userName}
              </h1>
            </div>
          </div>
        </header>

        <main
          className="flex-1 overflow-y-auto px-6 py-4 pb-40 relative z-10 scrollbar-hide touch-pan-y"
          style={{ overscrollBehaviorY: "contain" }}
        >
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#1A1812] border border-[#D4AF37]/20 p-4 rounded-2xl shadow-xl active:bg-[#26231A] transition-all">
              <Sparkles className="w-4 h-4 mb-2 text-[#FBF0B2]" />
              <p className="text-[9px] uppercase font-black text-[#D4AF37]/40 tracking-wider">
                AI Tavsiya
              </p>
              <p className="text-sm font-bold text-white">Vazifalar</p>
            </div>
            <div className="bg-[#1A1812] border border-[#D4AF37]/20 p-4 rounded-2xl shadow-xl active:bg-[#26231A] transition-all">
              <Trophy className="w-4 h-4 mb-2 text-[#FBF0B2]" />
              <p className="text-[9px] uppercase font-black text-[#D4AF37]/40 tracking-wider">
                Yutuqlar
              </p>
              <p className="text-sm font-bold text-white">#1 Rank</p>
            </div>
          </div>

          {/* Zikr List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                Muborak zikrlar
              </h2>
              <div className="h-[1px] flex-1 bg-[#D4AF37]/10 ml-4"></div>
            </div>

            {dailyZikrData.map((zikr, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedZikr(zikr);
                  setCount(0);
                }}
                className="bg-[#1A1812] border border-[#D4AF37]/10 rounded-[24px] p-4 flex flex-col gap-2 shadow-md active:bg-[#26231A] active:scale-[0.98] transition-all border-l-4 border-l-[#D4AF37] touch-manipulation"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-black/40 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                      {zikr.emoji}
                    </span>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-tight">
                        {zikr.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Zap className="w-2.5 h-2.5 text-[#FBF0B2]/60" />
                        <p className="text-[9px] text-[#D4AF37]/60 font-medium italic truncate max-w-[140px]">
                          {zikr.benefit}
                        </p>
                      </div>
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

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 z-[60] bg-[#0F0E0A]/95 backdrop-blur-md border-t border-[#D4AF37]/10 px-6 pt-3 pb-8">
          <div className="flex justify-around items-center h-12 max-w-md mx-auto">
            <NavItem
              icon={Home}
              label="Asosiy"
              active={activeNav === "home"}
              onClick={() => setActiveNav("home")}
            />
            <NavItem
              icon={BookOpen}
              label="Kurslar"
              active={activeNav === "books"}
              onClick={() => setActiveNav("books")}
            />
            <div className="relative -mt-12">
              <button className="w-14 h-14 bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center shadow-lg border-[4px] border-[#0F0E0A] active:scale-90 transition-all">
                <Sparkles className="w-6 h-6 text-black fill-current" />
              </button>
            </div>
            <NavItem
              icon={HelpCircle}
              label="Savol"
              active={activeNav === "qa"}
              onClick={() => setActiveNav("qa")}
            />
            <NavItem
              icon={User}
              label="Profil"
              active={activeNav === "profile"}
              onClick={() => setActiveNav("profile")}
            />
          </div>
        </nav>

        {/* Tasbih View Modal */}
        {selectedZikr && (
          <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col p-6 overflow-hidden touch-none animate-in slide-in-from-bottom duration-300">
            <header className="flex justify-between items-center mb-4 shrink-0">
              <button
                onClick={() => setSelectedZikr(null)}
                className="p-2.5 bg-white/5 rounded-full border border-white/10 active:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-[#FBF0B2]" />
              </button>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#FBF0B2]">
                Tasbih rejimi
              </p>
              <div className="w-10"></div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 overflow-hidden">
              <div className="text-center shrink-0 px-4 w-full">
                <p
                  className="text-5xl md:text-6xl font-serif text-[#FBF0B2] mb-6 drop-shadow-[0_0_20px_rgba(251,240,178,0.3)] leading-relaxed"
                  style={{ direction: "rtl" }}
                >
                  {selectedZikr.arabicText}
                </p>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-4">
                  {selectedZikr.name}
                </h2>
                <div className="bg-[#D4AF37]/5 py-4 px-6 rounded-3xl border border-[#D4AF37]/10">
                  <p className="text-[12px] text-[#FBF0B2]/80 leading-relaxed italic text-center">
                    "{selectedZikr.benefit}"
                  </p>
                </div>
              </div>

              {/* Circle UI */}
              <div
                onClick={handleCount}
                className="w-56 h-56 rounded-full relative flex items-center justify-center active:scale-[0.95] transition-all shrink-0 select-none touch-manipulation"
              >
                <div className="absolute inset-0 rounded-full border-[6px] border-[#D4AF37]/5 shadow-inner"></div>
                <div className="relative text-center z-10">
                  <span className="text-7xl font-black text-white leading-none tabular-nums tracking-tighter drop-shadow-lg">
                    {count}
                  </span>
                  <p className="text-[#FBF0B2] text-[10px] font-black uppercase tracking-[0.3em] mt-4 animate-pulse">
                    Bosish
                  </p>
                </div>
                <svg
                  viewBox="0 0 200 200"
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-[1.03]"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="94"
                    fill="transparent"
                    stroke="#FBF0B2"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 94}
                    strokeDashoffset={
                      2 * Math.PI * 94 * (1 - count / selectedZikr.count)
                    }
                    className="transition-all duration-300 drop-shadow-[0_0_15px_rgba(251,240,178,0.7)]"
                  />
                </svg>
              </div>
            </div>

            <footer className="grid grid-cols-2 gap-4 mt-auto pt-6 pb-6 shrink-0">
              <button
                onClick={() => setCount(0)}
                className="py-5 bg-white/5 rounded-3xl text-[11px] font-black uppercase border border-white/10 text-[#FBF0B2] active:bg-white/10 transition-colors"
              >
                Qayta
              </button>
              <button
                onClick={() => setSelectedZikr(null)}
                className="py-5 bg-[#D4AF37] text-black rounded-3xl text-[11px] font-black uppercase shadow-xl shadow-[#D4AF37]/20 active:brightness-110"
              >
                Tugatish
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
        active ? "opacity-100 scale-105" : "opacity-40"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${active ? "text-[#FBF0B2]" : "text-[#D4AF37]"}`}
      />
      <span
        className={`text-[9px] font-black uppercase tracking-tighter ${
          active ? "text-[#FBF0B2]" : "text-[#D4AF37]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
