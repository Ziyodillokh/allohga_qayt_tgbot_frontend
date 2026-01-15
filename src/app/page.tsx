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
  ChevronRight,
  HelpCircle,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Zikr {
  name: string;
  count: number;
  emoji: string;
  arabicText: string;
  translation: string;
  meaning: string;
  benefit: string;
}

export default function TelegramWebBotApp() {
  const [activeNav, setActiveNav] = useState("home");
  const [selectedZikr, setSelectedZikr] = useState<Zikr | null>(null);
  const [count, setCount] = useState(0);

  // WebBot uchun scrollni bloklash (modal ochilganda)
  useEffect(() => {
    if (selectedZikr) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedZikr]);

  const dailyZikr: Zikr[] = [
    {
      name: "Istighfar",
      count: 100,
      emoji: "🤲",
      arabicText: "أَسْتَغْفِرُ اللّهَ",
      translation: "Astaghfirullah",
      meaning: "Allohdan kechirim so'rayman",
      benefit: "G'am-tashvishdan najot va kutilmagan rizq eshigi.",
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

  const handleZikrClick = (zikr: Zikr) => {
    setSelectedZikr(zikr);
    setCount(0);
  };

  return (
    <div className="flex justify-center bg-black min-h-screen">
      {/* Container - WebBot dizayni buzilmasligi uchun cheklangan kenglik */}
      <div className="w-full max-w-md bg-[#0F0E0A] text-[#E5C366] min-h-screen relative flex flex-col shadow-2xl">
        {/* Background Glows */}
        <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-[-5%] right-[-10%] w-72 h-72 bg-[#D4AF37] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-[#AA8232] rounded-full blur-[80px]"></div>
        </div>

        {/* Header - Sticky */}
        <header className="sticky top-0 z-30 pt-8 px-6 pb-4 border-b border-[#D4AF37]/10 bg-[#0F0E0A]/80 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FBF0B2] to-[#AA8232] p-[1.5px]">
                <div className="w-full h-full rounded-xl bg-[#14130F] flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#FBF0B2]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">
                  Islomiy
                </h1>
                <p className="text-[#D4AF37]/70 text-[9px] font-black uppercase tracking-widest mt-1">
                  Ziyodullo
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-[#D4AF37]/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-[#FBF0B2]" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32">
          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard icon={Sparkles} title="AI Tavsiya" sub="Vazifa" />
            <FeatureCard icon={Trophy} title="Yutuqlar" sub="120 XP" />
          </div>

          {/* Zikr List */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#D4AF37] rounded-full"></div>
              <h2 className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                Kunlik Vazifalar
              </h2>
            </div>

            {dailyZikr.map((zikr, idx) => (
              <div
                key={idx}
                onClick={() => handleZikrClick(zikr)}
                className="bg-[#1A1812]/80 border border-[#D4AF37]/10 rounded-[24px] p-5 active:scale-[0.97] transition-all border-l-2 border-l-[#D4AF37]/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#26231A] rounded-lg flex items-center justify-center text-xl border border-[#D4AF37]/10">
                      {zikr.emoji}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">
                        {zikr.name}
                      </h3>
                      <p className="text-[9px] text-[#D4AF37]/60 font-bold uppercase">
                        {zikr.translation}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                    <span className="text-white font-black text-lg">
                      {zikr.count}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-3 border-t border-white/5">
                  <Zap className="w-3 h-3 text-[#FBF0B2] mt-0.5 shrink-0" />
                  <p className="text-[10px] text-white/60 leading-tight italic">
                    {zikr.benefit}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </main>

        {/* Bottom Navigation - Fixed at Bottom of Container */}
        <nav className="absolute bottom-0 left-0 right-0 bg-[#0F0E0A]/90 backdrop-blur-2xl border-t border-[#D4AF37]/10 px-4 pb-6 pt-3 z-40">
          <div className="flex justify-around items-center h-16">
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

            <div className="relative -mt-10">
              <button className="w-14 h-14 bg-gradient-to-br from-[#FBF0B2] to-[#AA8232] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 border-[4px] border-[#0F0E0A] active:scale-90 transition-all">
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

        {/* Tasbih Modal - Full Screen Telegram Style */}
        {selectedZikr && (
          <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
            <div className="p-6 flex justify-between items-center">
              <button
                onClick={() => setSelectedZikr(null)}
                className="p-2 bg-white/5 rounded-full border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              <span className="text-[10px] font-black tracking-widest uppercase">
                Tasbih
              </span>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="text-center mb-8">
                <p
                  className="text-6xl font-serif text-[#FBF0B2] mb-4"
                  style={{ direction: "rtl" }}
                >
                  {selectedZikr.arabicText}
                </p>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedZikr.name}
                </h2>
                <p className="text-white/40 text-sm italic italic">
                  "{selectedZikr.meaning}"
                </p>
              </div>

              {/* Counter - WebBot uchun o'lchami kichraytirildi */}
              <div
                onClick={() =>
                  count < selectedZikr.count && setCount((c) => c + 1)
                }
                className="w-64 h-64 rounded-full relative flex items-center justify-center active:scale-95 transition-all shadow-[0_0_40px_rgba(212,175,55,0.15)]"
              >
                <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20 animate-pulse"></div>
                <div className="text-center z-10">
                  <span className="text-8xl font-black text-white">
                    {count}
                  </span>
                  <p className="text-[#FBF0B2] text-[10px] font-bold uppercase tracking-widest mt-1">
                    Bosing
                  </p>
                </div>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="transparent"
                    stroke="#FBF0B2"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={
                      2 * Math.PI * 120 * (1 - count / selectedZikr.count)
                    }
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setCount(0)}
                className="py-4 bg-white/5 rounded-2xl border border-white/10 font-bold uppercase text-[10px]"
              >
                Qayta
              </button>
              <button
                onClick={() => setSelectedZikr(null)}
                className="py-4 bg-[#D4AF37] text-black rounded-2xl font-black uppercase text-[10px]"
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

function FeatureCard({ icon: Icon, title, sub }: any) {
  return (
    <div className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-2xl p-4 active:scale-95 transition-all">
      <div className="w-8 h-8 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-[#FBF0B2]" />
      </div>
      <h3 className="text-white font-bold text-xs">{title}</h3>
      <p className="text-[#D4AF37]/50 text-[8px] font-bold uppercase mt-0.5">
        {sub}
      </p>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? "opacity-100 scale-105" : "opacity-40"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${active ? "text-[#FBF0B2]" : "text-[#D4AF37]"}`}
      />
      <span className="text-[8px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </button>
  );
}
