"use client";

import { useState } from "react";
import ChatbotQA from "@/components/test/ChatbotQA";

export default function TestPage() {
  const [selectedCategory, setSelectedCategory] = useState("quron");
  const [showChatbot, setShowChatbot] = useState(true);

  const categories = [
    { name: "quron", label: "Qur'on" },
    { name: "hadis", label: "Hadis" },
    { name: "aqida", label: "Aqida" },
    { name: "fiqh", label: "Fiqh" },
    { name: "seerat", label: "Seerat" },
    { name: "zikr", label: "Zikr & Duolar" },
  ];

  if (showChatbot) {
    return (
      <ChatbotQA
        category={selectedCategory}
        difficulty="easy"
        onClose={() => setShowChatbot(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F0E0A] flex flex-col p-6 overflow-hidden"
      style={{ backgroundColor: "#0F0E0A" }}
    >
      {/* Orqa fon nur */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-[-5%] right-[-10%] w-64 h-64 bg-[#D4AF37] rounded-full blur-[110px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-[#AA8232] rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-[#FBF0B2] mb-6">
          Kategoriyani Tanlang
        </h1>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setShowChatbot(true);
              }}
              className="p-4 bg-[#1A1812] border border-[#D4AF37]/30 rounded-2xl text-[#FBF0B2] font-semibold hover:bg-[#26231A] hover:border-[#D4AF37]/60 transition-all active:scale-95"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
