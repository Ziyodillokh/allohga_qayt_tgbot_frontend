"use client";

import {
  Home,
  BookOpen,
  User,
  Sparkles,
  Trophy,
  X,
  Star,
  Crown,
  Award,
  Medal,
  Search,
  Zap,
  ChevronRight,
  Heart,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";

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

  const dailyZikr: Zikr[] = [
    {
      name: "Istighfar",
      count: 100,
      emoji: "🤲",
      arabicText: "أَسْتَغْفِرُ اللّهَ",
      translation: "Astaghfirullah",
      meaning: "Allohdan kechirim so'rayman",
      benefit: "G'am-tashvishdan najot, kutilmagan rizq va baraka eshigi.",
    },
    {
      name: "Salawat",
      count: 50,
      emoji: "☪️",
      arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
      translation: "Allohumma solli ala Muhammad",
      meaning: "Allohim, Muhammadga salovat ayt",
      benefit:
        "Sizga Alloh 10 marta salovat aytadi va Qiyomatda Rasulullohga yaqin bo'lasiz.",
    },
    {
      name: "SubhanAllah",
      count: 33,
      emoji: "✨",
      arabicText: "سُبْحَانَ اللّهِ",
      translation: "Subhanalloh",
      meaning: "Alloh barcha nuqsonlardan pokdir",
      benefit:
        "Jannatda siz uchun bir daraxt ekiladi va gunohlar dengiz ko'pigicha bo'lsa ham kechiriladi.",
    },
    {
      name: "Alhamdulillah",
      count: 33,
      emoji: "🙏",
      arabicText: "الْحَمْدُ لِلّهِ",
      translation: "Alhamdulillah",
      meaning: "Barcha hamdlar Allohga xosdir",
      benefit:
        "Shukr qiluvchilar ne'mati ziyoda qilinadi va savob tarozisi to'ladi.",
    },
    {
      name: "La ilaha illallah",
      count: 100,
      emoji: "☝️",
      arabicText: "لَا إِلَهَ إِلَّا اللّهُ",
      translation: "La ilaha illallah",
      meaning: "Allohdan boshqa iloh yo'q",
      benefit: "Zikrning eng afzali, imonni yangilaydi va jannat kalitidir.",
    },
  ];

  const handleZikrClick = (zikr: Zikr) => {
    setSelectedZikr(zikr);
    setCount(0);
  };

  const getMotivation = () => {
    if (!selectedZikr) return "";
    const progress = (count / selectedZikr.count) * 100;
    if (progress === 0) return "Bismillah!";
    if (progress < 50) return "Alloh zikringizni qabul qilsin! ✨";
    if (progress < 100) return "Deyarli tugatdingiz! 🌟";
    return "MashaAlloh, yakunladingiz! 🎉";
  };

  return (
    // Orqa fon rangi biroz "Gold-tinted" ochiqroq qora bo'ldi
    <div className="min-h-screen bg-[#0F0E0A] text-[#E5C366] font-sans pb-36 relative overflow-x-hidden">
      {/* Background Glows - Yorqinroq va tilla rang */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[5%] left-[-10%] w-[500px] h-[500px] bg-[#AA8232] rounded-full blur-[160px]"></div>
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-[#D4AF37]/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-10 px-6 pb-6 border-b border-[#D4AF37]/10 bg-[#0F0E0A]/40 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[2px] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full rounded-2xl bg-[#14130F] flex items-center justify-center">
                <Crown className="w-7 h-7 text-[#FBF0B2]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
                Islomiy Darslar
              </h1>
              <p className="text-[#D4AF37]/70 text-[10px] font-black uppercase tracking-[0.2em]">
                Ziyodullo • Musulmon
              </p>
            </div>
          </div>
          <button className="w-11 h-11 rounded-2xl bg-white/5 border border-[#D4AF37]/20 flex items-center justify-center active:scale-90 transition-all">
            <Search className="w-5 h-5 text-[#FBF0B2]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 space-y-8 pt-6">
        {/* Top Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-[30px] p-6 shadow-xl active:scale-95 transition-all">
            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mb-5 border border-[#D4AF37]/20">
              <Sparkles className="w-5 h-5 text-[#FBF0B2]" />
            </div>
            <h3 className="text-white font-bold text-sm tracking-wide">
              AI Tavsiya
            </h3>
            <p className="text-[#D4AF37]/50 text-[10px] uppercase font-bold mt-1">
              Vazifa yaratish
            </p>
          </div>

          <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-[30px] p-6 shadow-xl active:scale-95 transition-all">
            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center mb-5 border border-[#D4AF37]/20">
              <Trophy className="w-5 h-5 text-[#FBF0B2]" />
            </div>
            <h3 className="text-white font-bold text-sm tracking-wide">
              Yutuqlar
            </h3>
            <p className="text-[#D4AF37]/50 text-[10px] uppercase font-bold mt-1">
              120 XP • Rank #1
            </p>
          </div>
        </div>

        {/* Zikrlar Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#FBF0B2] to-[#D4AF37] rounded-full shadow-[0_0_15px_#D4AF37]"></div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.25em]">
                Kunlik Vazifalar
              </h2>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D4AF37]/40" />
          </div>

          <div className="space-y-4">
            {dailyZikr.map((zikr, idx) => (
              <div
                key={idx}
                onClick={() => handleZikrClick(zikr)}
                className="bg-[#1A1812] border border-[#D4AF37]/20 rounded-[32px] p-6 shadow-lg active:scale-[0.98] transition-all cursor-pointer group hover:border-[#D4AF37]/60 hover:bg-[#1E1C15]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#26231A] rounded-2xl flex items-center justify-center text-2xl border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-all">
                      {zikr.emoji}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base tracking-wide">
                        {zikr.name}
                      </h3>
                      <p className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-widest">
                        {zikr.translation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tighter">
                      {zikr.count}
                    </span>
                    <span className="text-[10px] text-[#D4AF37] font-bold ml-1 uppercase">
                      marta
                    </span>
                  </div>
                </div>

                {/* Va'da qilingan ajr - Benefit Section - Tiniqroq fon */}
                <div className="bg-[#D4AF37]/10 rounded-[22px] p-4 border border-[#D4AF37]/20 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#FBF0B2] mt-0.5 shrink-0 fill-[#FBF0B2]/20" />
                  <p className="text-[12px] text-white/90 leading-relaxed font-medium italic">
                    {zikr.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0E0A]/95 backdrop-blur-2xl border-t border-[#D4AF37]/10 px-6 pt-4 pb-10 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex justify-around items-end">
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

          <div className="px-2">
            <button className="w-16 h-16 bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.4)] -translate-y-4 border-[4px] border-[#0F0E0A] active:scale-90 transition-all">
              <Sparkles className="w-7 h-7 text-[#0F0E0A] fill-current" />
            </button>
            <p className="text-[10px] font-black text-[#D4AF37] uppercase text-center -translate-y-2 tracking-tighter">
              Ruhiy Holat
            </p>
          </div>

          <NavItem
            icon={HelpCircle}
            label="Savollar"
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

      {/* Tasbih Modal */}
      {selectedZikr && (
        <div className="fixed inset-0 bg-[#0F0E0A] z-50 flex flex-col p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="w-10 h-10"></div>
            <h2 className="text-[#FBF0B2] font-black uppercase tracking-[0.4em] text-[10px]">
              Tasbih Mode
            </h2>
            <button
              onClick={() => setSelectedZikr(null)}
              className="p-3 bg-white/5 rounded-2xl border border-[#D4AF37]/20 active:scale-90 transition-all"
            >
              <X className="text-[#FBF0B2] w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-12 space-y-4">
              <p
                className="text-7xl font-serif text-[#FBF0B2] leading-relaxed drop-shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                style={{ direction: "rtl" }}
              >
                {selectedZikr.arabicText}
              </p>
              <h3 className="text-white text-2xl font-bold tracking-wide">
                {selectedZikr.name}
              </h3>
              <p className="text-[#D4AF37]/70 text-base max-w-[280px] mx-auto italic font-medium">
                "{selectedZikr.meaning}"
              </p>
            </div>

            {/* Counter Circle - Ochiqroq va yorqinroq */}
            <div
              onClick={() =>
                count < selectedZikr.count && setCount((c) => c + 1)
              }
              className="w-80 h-80 rounded-full relative flex items-center justify-center cursor-pointer group active:scale-95 transition-all shadow-[0_0_60px_rgba(212,175,55,0.1)]"
            >
              <div className="absolute inset-0 rounded-full border-[2px] border-[#D4AF37]/30 animate-pulse"></div>
              <div className="absolute inset-6 rounded-full bg-[#1A1812] border border-[#D4AF37]/10 shadow-inner"></div>

              <div className="relative text-center">
                <span className="text-9xl font-black text-white tracking-tighter drop-shadow-lg">
                  {count}
                </span>
                <p className="text-[#FBF0B2] text-[12px] font-black uppercase tracking-[0.3em] mt-2">
                  {count === selectedZikr.count ? "Tamom" : "Bosing"}
                </p>
              </div>

              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-105">
                <circle
                  cx="160"
                  cy="160"
                  r="145"
                  fill="transparent"
                  stroke="#FBF0B2"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 145}
                  strokeDashoffset={
                    2 * Math.PI * 145 * (1 - count / selectedZikr.count)
                  }
                  className="transition-all duration-300 drop-shadow-[0_0_8px_#D4AF37]"
                />
              </svg>
            </div>

            <p className="mt-12 text-[#FBF0B2]/60 font-black text-sm uppercase tracking-[0.2em] animate-bounce">
              {getMotivation()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pb-4">
            <button
              onClick={() => setCount(0)}
              className="py-6 bg-white/5 text-[#FBF0B2] font-black rounded-[28px] border border-[#D4AF37]/20 active:scale-95 transition-all uppercase text-[11px] tracking-widest"
            >
              Qayta boshlash
            </button>
            <button
              onClick={() => setSelectedZikr(null)}
              className="py-6 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-[#0F0E0A] font-black rounded-[28px] active:scale-95 transition-all uppercase text-[11px] tracking-widest shadow-lg shadow-[#D4AF37]/20"
            >
              Yakunlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 min-w-[60px] transition-all duration-300 ${
        active ? "opacity-100 scale-110" : "opacity-40 hover:opacity-70"
      }`}
    >
      <Icon
        className={`w-6 h-6 ${active ? "text-[#FBF0B2]" : "text-[#D4AF37]"}`}
      />
      <span
        className={`text-[10px] font-black uppercase tracking-tighter ${
          active ? "text-[#FBF0B2]" : "text-[#D4AF37]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
