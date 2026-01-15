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
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";

// Zikr interfeysi
interface Zikr {
  name: string;
  count: number;
  emoji: string;
  arabicText: string;
  translation: string;
  meaning: string;
  benefit: string;
}

export default function LuxuryZikrApp() {
  const [activeNav, setActiveNav] = useState("home");
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const [count, setCount] = useState(0);

  // Zikrlar bazasi
  const dailyZikr: Zikr[] = [
    {
      name: "Istighfar",
      count: 100,
      emoji: "🤲",
      arabicText: "أَسْتَغْفِرُ اللّهَ",
      translation: "Astaghfirullah",
      meaning: "Allohdan kechirim so'rayman",
      benefit: "G'am-tashvishdan najot va baraka eshigi.",
    },
    {
      name: "Salawat",
      count: 50,
      emoji: "☪️",
      arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
      translation: "Allohumma solli ala Muhammad",
      meaning: "Allohim, Muhammadga salovat ayt",
      benefit: "Sizga Alloh 10 marta salovat aytadi.",
    },
    {
      name: "SubhanAllah",
      count: 33,
      emoji: "✨",
      arabicText: "سُبْحَانَ اللّهِ",
      translation: "Subhanalloh",
      meaning: "Alloh barcha nuqsonlardan pokdir",
      benefit: "Jannatda siz uchun bir daraxt ekiladi.",
    },
    {
      name: "Alhamdulillah",
      count: 33,
      emoji: "🙏",
      arabicText: "الْحَمْدُ لِلّهِ",
      translation: "Alhamdulillah",
      meaning: "Barcha hamdlar Allohga xosdir",
      benefit: "Shukr qiluvchilar ne'mati ziyoda qilinadi.",
    },
    {
      name: "La ilaha illallah",
      count: 100,
      emoji: "☝️",
      arabicText: "لَا إِلَهَ إِلَّا اللّهُ",
      translation: "La ilaha illallah",
      meaning: "Allohdan boshqa iloh yo'q",
      benefit: "Zikrning eng afzali va jannat kalitidir.",
    },
  ];

  // Tasbih tugaganda haptic feedback (Telegram WebApp uchun)
  const handleCount = () => {
    if (selectedZikr && count < selectedZikr.count) {
      setCount((prev) => prev + 1);
      // Telegram titratish funksiyasi (agar script ulangan bo'lsa)
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }
    }
  };

  return (
    <div className="flex justify-center bg-black min-h-[100dvh]">
      {/* Asosiy Container */}
      <div className="w-full max-w-md bg-[#0F0E0A] text-[#E5C366] flex flex-col relative h-[100dvh] overflow-hidden">
        {/* Orqa fon effektlari */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#D4AF37] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-[#AA8232] rounded-full blur-[100px]"></div>
        </div>

        {/* Header - Qat'iy joylashgan */}
        <header className="relative z-20 pt-6 px-6 pb-4 border-b border-[#D4AF37]/10 bg-[#0F0E0A]/60 backdrop-blur-md shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[1.5px] shadow-lg shadow-[#D4AF37]/10">
                <div className="w-full h-full rounded-xl bg-[#14130F] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#FBF0B2]" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                  Islomiy Darslar
                </h1>
                <p className="text-[#D4AF37]/60 text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                  Ziyodullo • Musulmon
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-[#D4AF37]/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-[#FBF0B2]" />
            </button>
          </div>
        </header>

        {/* Markaziy kontent - Scroll bo'ladigan qism */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 relative z-10 scrollbar-hide">
          {/* Kichik stat kartalari */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#1A1812] border border-[#D4AF37]/20 p-4 rounded-2xl shadow-xl">
              <Sparkles className="w-4 h-4 mb-2 text-[#FBF0B2]" />
              <p className="text-[9px] uppercase font-black text-[#D4AF37]/40 tracking-wider">
                AI Tavsiya
              </p>
              <p className="text-sm font-bold text-white">Vazifalar</p>
            </div>
            <div className="bg-[#1A1812] border border-[#D4AF37]/20 p-4 rounded-2xl shadow-xl">
              <Trophy className="w-4 h-4 mb-2 text-[#FBF0B2]" />
              <p className="text-[9px] uppercase font-black text-[#D4AF37]/40 tracking-wider">
                Yutuqlar
              </p>
              <p className="text-sm font-bold text-white">120 XP</p>
            </div>
          </div>

          {/* Ro'yxat */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
              <h2 className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                Kunlik Vazifalar
              </h2>
            </div>

            {dailyZikr.map((zikr, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedZikr(zikr);
                  setCount(0);
                }}
                className="bg-[#1A1812] border border-[#D4AF37]/10 rounded-[28px] p-5 active:scale-[0.97] transition-all flex items-center justify-between group hover:border-[#D4AF37]/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#26231A] rounded-xl flex items-center justify-center text-xl border border-[#D4AF37]/5">
                    {zikr.emoji}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-wide">
                      {zikr.name}
                    </h3>
                    <p className="text-[9px] text-[#D4AF37]/50 font-bold uppercase tracking-widest">
                      {zikr.translation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">
                    {zikr.count}
                  </span>
                  <p className="text-[8px] text-[#D4AF37] font-bold uppercase">
                    marta
                  </p>
                </div>
              </div>
            ))}
          </section>
        </main>

        {/* Navigatsiya - EKRAN TUBIGA YOPISHGAN */}
        <nav className="absolute bottom-0 left-0 right-0 z-50 bg-[#0F0E0A] border-t border-[#D4AF37]/10 px-6 pt-3 pb-8">
          <div className="flex justify-around items-center h-12">
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
              <button className="w-14 h-14 bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border-[4px] border-[#0F0E0A] active:scale-90 transition-all">
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

        {/* Tasbih Modali - Optimallashgan */}
        {selectedZikr && (
          <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col p-6 animate-in slide-in-from-bottom duration-300 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setSelectedZikr(null)}
                className="p-2 bg-white/5 rounded-full border border-white/10 active:scale-90 transition-all"
              >
                <X className="w-6 h-6 text-[#FBF0B2]" />
              </button>
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#FBF0B2]">
                Tasbeeh Rejimi
              </p>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-10">
              <div className="text-center shrink-0">
                <p
                  className="text-6xl font-serif text-[#FBF0B2] mb-3 drop-shadow-[0_0_15px_rgba(251,240,178,0.3)]"
                  style={{ direction: "rtl" }}
                >
                  {selectedZikr.arabicText}
                </p>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  {selectedZikr.name}
                </h2>
                <p className="text-[#D4AF37]/60 text-sm mt-2 italic font-medium px-6 leading-relaxed">
                  "{selectedZikr.meaning}"
                </p>
              </div>

              {/* Tasbeeh Aylanasi - Buzilmaydigan dizayn */}
              <div
                onClick={handleCount}
                className="w-60 h-60 rounded-full relative flex items-center justify-center active:scale-95 transition-all shrink-0 select-none shadow-[0_0_50px_rgba(212,175,55,0.05)]"
              >
                <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/10"></div>
                <div className="absolute inset-4 rounded-full bg-[#1A1812] border border-[#D4AF37]/5 shadow-inner"></div>

                <div className="relative text-center z-10">
                  <span className="text-8xl font-black text-white leading-none tracking-tighter">
                    {count}
                  </span>
                  <p className="text-[#FBF0B2] text-[11px] font-black uppercase tracking-[0.3em] mt-3 animate-pulse">
                    Bosing
                  </p>
                </div>

                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.01]">
                  <circle
                    cx="120"
                    cy="120"
                    r="115"
                    fill="transparent"
                    stroke="#FBF0B2"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 115}
                    strokeDashoffset={
                      2 * Math.PI * 115 * (1 - count / selectedZikr.count)
                    }
                    className="transition-all duration-300 drop-shadow-[0_0_10px_rgba(251,240,178,0.5)]"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto pt-8 pb-4">
              <button
                onClick={() => setCount(0)}
                className="py-5 bg-white/5 rounded-3xl text-[11px] font-black uppercase border border-white/10 text-[#FBF0B2] active:scale-95 transition-all"
              >
                Qayta
              </button>
              <button
                onClick={() => setSelectedZikr(null)}
                className="py-5 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-3xl text-[11px] font-black uppercase shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all"
              >
                Tugatish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Navigatsiya tugmasi komponenti
function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
        active ? "opacity-100 scale-110" : "opacity-40 hover:opacity-60"
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
