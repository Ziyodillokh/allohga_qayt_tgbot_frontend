"use client";

import {
  Heart,
  Home,
  BookOpen,
  Bot,
  HelpCircle,
  User,
  Sparkles,
  Trophy,
  Flame,
  X,
  Star,
  Crown,
  Award,
  Medal,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("home");
  const [selectedZikr, setSelectedZikr] = useState(null);
  const [count, setCount] = useState(0);

  const dailyZikr = [
    {
      name: "Astaghfirullah",
      count: 100,
      emoji: "🤲",
      arabicText: "أَسْتَغْفِرُ اللّهَ",
      translation: "Astaghfirulloh",
      meaning: "Allohdan kechirim so'rayman",
    },
    {
      name: "Salawat",
      count: 50,
      emoji: "☪️",
      arabicText: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
      translation: "Allohumma solli ala Muhammad",
      meaning: "Allohim, Muhammadga salovat ayt",
    },
    {
      name: "SubhanAllah",
      count: 33,
      emoji: "✨",
      arabicText: "سُبْحَانَ اللّهِ وَبِحَمْدِهِ",
      translation: "Subhanalloh wa bihamdihi",
      meaning: "Alloh pokdir va unga hamd aytaman",
    },
    {
      name: "Alhamdulillah",
      count: 100,
      emoji: "🙏",
      arabicText: "الْحَمْدُ لِلّهِ",
      translation: "Alhamdulillah",
      meaning: "Barcha hamdlar Allohga xosdir",
    },
    {
      name: "La ilaha illallah",
      count: 100,
      emoji: "☪️",
      arabicText: "لَا إِلَهَ إِلَّا اللّهُ",
      translation: "La ilaha illalloh",
      meaning: "Allohdan boshqa iloh yo'q",
    },
  ];

  const handleZikrClick = (zikr) => {
    setSelectedZikr(zikr);
    setCount(0);
  };

  const handleTasbihClick = () => {
    if (selectedZikr && count < selectedZikr.count) {
      setCount((prev) => prev + 1);
    }
  };

  const handleClose = () => {
    setSelectedZikr(null);
    setCount(0);
  };

  const getMotivation = () => {
    if (!selectedZikr) return "";
    const progress = (count / selectedZikr.count) * 100;
    if (progress === 0) return "Bismillah! Boshlaylik";
    if (progress < 25) return "Ajoyib boshladingiz! 💫";
    if (progress < 50) return "Davom eting! Zo'r ketmoqda! 🌟";
    if (progress < 75) return "Yaxshi! Deyarli yarmini tugatdingiz! ⭐";
    if (progress < 100) return "Zo'r! Oxirigacha yetib keldingiz! 🎯";
    return "Barakalloh! Maqsadga yetdingiz! 🎉";
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-950 to-brown-900 pb-28 relative overflow-hidden"
      style={{ backgroundColor: "#1a0f0a" }}
    >
      {/* Decorative Background Pattern */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Header */}
      <div className="relative px-6 pt-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-900 to-yellow-900 flex items-center justify-center">
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <h1
                className="text-3xl font-serif font-bold text-amber-100 mb-1"
                style={{ letterSpacing: "0.5px" }}
              >
                Islomiy Darslar
              </h1>
              <p className="text-amber-300/80 text-sm font-medium">
                Assalomu alaykum, Ziyodullo!
              </p>
            </div>
          </div>
          <button className="p-2.5 hover:bg-amber-900/30 rounded-full transition-colors">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400/50"></div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/30 backdrop-blur-sm rounded-2xl p-5 border border-amber-700/30 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-3 shadow-lg">
              <Sparkles className="w-6 h-6 text-amber-50" />
            </div>
            <h3 className="text-amber-100 font-bold text-lg mb-1 flex items-center gap-2">
              AI Tavsiya ✨
            </h3>
            <p className="text-amber-300/70 text-sm font-medium">
              Kurs yarating
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/30 backdrop-blur-sm rounded-2xl p-5 border border-amber-700/30 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-6 h-6 text-amber-50" />
            </div>
            <h3 className="text-amber-100 font-bold text-lg mb-1">Yutuqlar</h3>
            <p className="text-amber-300/70 text-sm font-medium">
              XP va reyting
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          <h2 className="text-2xl font-bold text-amber-100">Kunlik zikrlar</h2>
        </div>

        {/* Zikr Cards - Horizontal Scroll */}
        <div
          className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dailyZikr.map((zikr, idx) => (
            <div
              key={idx}
              onClick={() => handleZikrClick(zikr)}
              className="flex-shrink-0 w-64 cursor-pointer group"
            >
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-amber-900/50 bg-gradient-to-br from-amber-900/50 to-orange-900/40 backdrop-blur-sm border border-amber-700/30">
                {/* Islamic Pattern Overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }}
                ></div>

                {/* Gold Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-xl border-3 border-amber-200/40">
                    <Medal className="w-7 h-7 text-white" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-amber-950/95 via-amber-900/90 to-transparent backdrop-blur-md p-5 flex flex-col justify-end border-t border-amber-700/20">
                  {/* Arabic Text */}
                  <div className="mb-4">
                    <p
                      className="text-3xl font-bold text-center mb-2"
                      style={{
                        direction: "rtl",
                        fontFamily: "serif",
                        color: "#D4AF37",
                      }}
                    >
                      {zikr.arabicText}
                    </p>
                  </div>

                  {/* Count Display */}
                  <div className="bg-gradient-to-r from-amber-900/60 to-yellow-900/50 rounded-2xl p-3 mb-3 border border-amber-700/40 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-black text-amber-400">
                        {zikr.count}
                      </span>
                      <span className="text-xl font-bold text-amber-300">
                        marta
                      </span>
                    </div>
                  </div>

                  {/* Name and Duration */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-amber-100 mb-1">
                      {zikr.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-amber-300/70">
                      <div className="w-4 h-4 rounded-full bg-amber-400/60"></div>
                      <span className="text-xs font-semibold">5-7 daqiqa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Stats */}
        <div className="mt-8 bg-gradient-to-br from-amber-900/40 to-orange-900/30 backdrop-blur-sm rounded-3xl p-6 border border-amber-700/30 shadow-xl">
          <h3 className="text-amber-100 font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Bugungi natijalar
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">120</p>
              <p className="text-amber-300/70 text-xs font-semibold">XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">3</p>
              <p className="text-amber-300/70 text-xs font-semibold">Kun</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">15</p>
              <p className="text-amber-300/70 text-xs font-semibold">Daqiqa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasbih Modal */}
      {selectedZikr && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button
              onClick={handleClose}
              className="absolute -top-14 right-0 p-4 bg-amber-900/50 hover:bg-amber-800/50 rounded-full transition-all border border-amber-700/50"
            >
              <X className="w-6 h-6 text-amber-100" />
            </button>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-900/50 to-orange-900/40 backdrop-blur-sm border border-amber-700/30 p-8">
              {/* Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23D4AF37" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              ></div>

              <div className="relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{selectedZikr.emoji}</div>
                  <h3 className="text-3xl font-black text-amber-100 mb-2 drop-shadow-lg">
                    {selectedZikr.name}
                  </h3>
                  <p className="text-amber-200/90 font-semibold text-lg">
                    {selectedZikr.meaning}
                  </p>
                </div>

                {/* Counter */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <p className="text-8xl font-black bg-gradient-to-r from-amber-900 to-yellow-900 bg-clip-text text-transparent mb-3">
                      {count}
                    </p>
                    <p className="text-lg font-bold text-gray-700">
                      {getMotivation()}
                    </p>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 transition-all duration-500 shadow-lg"
                      style={{
                        width: `${Math.min(
                          (count / selectedZikr.count) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-3 px-2">
                    <span className="text-sm font-bold text-gray-600">0</span>
                    <span className="text-sm font-bold text-gray-600">
                      {selectedZikr.count}
                    </span>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
                  <p
                    className="text-5xl font-bold text-center mb-3"
                    style={{
                      direction: "rtl",
                      fontFamily: "serif",
                      color: "#1a0f0a",
                    }}
                  >
                    {selectedZikr.arabicText}
                  </p>
                  <p className="text-center text-gray-800 font-bold text-lg">
                    {selectedZikr.translation}
                  </p>
                </div>

                {/* Tasbih Button */}
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleTasbihClick}
                    disabled={count >= selectedZikr.count}
                    className="group/btn relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute -inset-6 bg-amber-400/40 rounded-full blur-2xl group-hover/btn:bg-amber-400/60 transition-all"></div>
                    <div className="relative w-56 h-56 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl flex items-center justify-center transition-all group-hover/btn:scale-110 group-active/btn:scale-95 border-4 border-white/50">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-white to-amber-50 shadow-2xl flex flex-col items-center justify-center border-4 border-white/80">
                        <p className="text-2xl font-black text-gray-800 mb-2">
                          اُنْقُرْ
                        </p>
                        <p className="text-sm font-bold text-gray-600">
                          Bosing
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCount(0)}
                    className="py-4 px-6 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-800 font-bold rounded-2xl transition-all active:scale-95 shadow-lg"
                  >
                    🔄 Qaytadan
                  </button>
                  <button
                    onClick={handleClose}
                    className="py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg"
                  >
                    ✓ Tugat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-amber-950 to-orange-950/95 backdrop-blur-xl border-t border-amber-800/30 shadow-2xl z-40"
        style={{ backgroundColor: "rgba(26, 15, 10, 0.95)" }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around py-4">
            <NavItem
              icon={Home}
              label="Bosh sahifa"
              active={activeNav === "home"}
              onClick={() => setActiveNav("home")}
            />
            <NavItem
              icon={BookOpen}
              label="Kurslar"
              active={activeNav === "books"}
              onClick={() => setActiveNav("books")}
            />
            <NavItem
              icon={Sparkles}
              label="Ruhiy holat"
              active={activeNav === "spiritual"}
              onClick={() => setActiveNav("spiritual")}
              isCenter
            />
            <NavItem
              icon={HelpCircle}
              label="Savol Javob"
              active={activeNav === "questions"}
              onClick={() => setActiveNav("questions")}
            />
            <NavItem
              icon={User}
              label="Profil"
              active={activeNav === "profile"}
              onClick={() => setActiveNav("profile")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  isCenter = false,
}) {
  return (
    <button onClick={onClick} className="focus:outline-none">
      <div
        className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-300 ${
          active
            ? "text-amber-400 scale-110"
            : "text-amber-300/60 hover:text-amber-300"
        } ${isCenter ? "transform -translate-y-2" : ""}`}
      >
        <Icon
          className={`w-6 h-6 transition-transform duration-300 ${
            active ? "scale-125" : ""
          } ${active ? "fill-amber-400" : ""}`}
        />
        <span className="text-xs font-bold">{label}</span>
      </div>
    </button>
  );
}
