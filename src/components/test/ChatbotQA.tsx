"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TestQuestion {
  number: number;
  category: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
}

interface Message {
  type: "bot" | "user" | "system";
  content: string;
  isCorrect?: boolean;
}

interface ChatbotQAProps {
  category?: string;
  difficulty?: string;
  onClose?: () => void;
}

export default function ChatbotQA({
  category = "quron",
  difficulty = "easy",
  onClose,
}: ChatbotQAProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/test/${category.toLowerCase()}/questions_${difficulty}.txt`
        );
        if (!response.ok) throw new Error("Fayl topilmadi");

        const text = await response.text();
        const lines = text.split("\n");
        const parsed: TestQuestion[] = [];
        let currentQ: Partial<TestQuestion> = {};
        let opts: { key: string; text: string }[] = [];
        let currentCat = "";

        lines.forEach((line) => {
          const l = line.trim();
          if (l.startsWith("KATEGORIYA:")) currentCat = l.split(":")[1].trim();
          else if (l.startsWith("SAVOL")) {
            if (currentQ.question && opts.length === 4) {
              parsed.push({
                ...currentQ,
                options: opts,
                category: currentCat,
              } as TestQuestion);
            }
            opts = [];
            const match = l.match(/SAVOL (\d+):\s*(.+)/);
            if (match)
              currentQ = { number: parseInt(match[1]), question: match[2] };
          } else if (l.match(/^[A-D]\)\s/)) {
            const [key, ...txt] = l.split(")");
            opts.push({ key: key.trim(), text: txt.join(")").trim() });
          } else if (l.startsWith("JAVOB:")) {
            currentQ.correctAnswer = l.replace("JAVOB:", "").trim();
          }
        });

        if (currentQ.question && opts.length === 4) {
          parsed.push({
            ...currentQ,
            options: opts,
            category: currentCat,
          } as TestQuestion);
        }

        const final20 = parsed.slice(0, 20);
        setQuestions(final20);
        if (final20.length > 0) {
          setMessages([{ type: "bot", content: final20[0].question }]);
        }
      } catch (err) {
        setMessages([{ type: "system", content: "Xatolik yuz berdi." }]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [category, difficulty]);

  const handleAnswerSelect = (answerKey: string) => {
    if (selectedAnswer || testComplete) return;

    const currentQ = questions[currentIndex];
    const isCorrect = answerKey === currentQ.correctAnswer;
    const selectedOpt = currentQ.options.find((o) => o.key === answerKey);

    setSelectedAnswer(answerKey);
    if (isCorrect) setScore((s) => s + 1);

    // 1. Foydalanuvchi javobi va tahlilni darhol chiqarish
    setMessages((prev) => [
      ...prev,
      { type: "user", content: `${answerKey}) ${selectedOpt?.text}` },
      {
        type: "system",
        content: isCorrect
          ? "To'g'ri. Barakalloh!"
          : `Noto'g'ri. Javob: ${currentQ.correctAnswer}`,
        isCorrect,
      },
    ]);

    // 2. 1 soniya kutib yangi savolga o'tish (Jami pauza siz xohlagandek silliq bo'ladi)
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        setSelectedAnswer(null); // Variantlar o'chib yonmasdan shunchaki yangilanadi
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: questions[next].question },
        ]);
      } else {
        setTestComplete(true);
      }
    }, 1500); // Tahlilni o'qish va yangi savol chiqishi orasidagi silliq vaqt
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-[#0F0E0A] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F0E0A] flex flex-col overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37] rounded-full blur-[150px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-30 px-6 pt-12 pb-4 flex justify-between items-center border-b border-white/5 bg-[#0F0E0A]/80 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="p-2.5 bg-white/5 rounded-full border border-white/10 active:scale-90"
        >
          <X className="w-5 h-5 text-[#FBF0B2]" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.4em] text-[#D4AF37] uppercase">
            Imtihon
          </p>
          <p className="text-white text-xs font-bold mt-1 tracking-widest">
            {currentIndex + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-3 py-1.5 rounded-xl border border-[#D4AF37]/20">
          <Zap className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
          <span className="text-xs font-black text-[#FBF0B2]">{score}</span>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide relative z-10">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            } animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            {msg.type === "system" ? (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold border ${
                  msg.isCorrect
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30"
                    : "bg-white/5 text-white/50 border-white/10"
                }`}
              >
                {msg.isCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                {msg.content}
              </div>
            ) : (
              <div
                className={`max-w-[85%] px-5 py-4 rounded-[26px] ${
                  msg.type === "user"
                    ? "bg-[#D4AF37] text-black rounded-tr-none font-bold shadow-lg"
                    : "bg-[#1A1812] border border-white/5 text-[#FBF0B2] rounded-tl-none"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-10" />
      </div>

      {/* Footer / Options */}
      <div className="relative z-30 px-6 pb-12 pt-4 bg-[#0F0E0A] border-t border-white/5">
        {!testComplete ? (
          <div className="grid grid-cols-1 gap-2.5">
            {questions[currentIndex]?.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswerSelect(option.key)}
                disabled={!!selectedAnswer}
                className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 flex items-center ${
                  selectedAnswer === option.key
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black font-bold scale-[0.98]"
                    : "border-white/5 bg-[#161510] text-[#FBF0B2] active:bg-[#1A1812]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl border border-current flex items-center justify-center mr-4 text-[10px] font-black transition-colors ${
                    selectedAnswer === option.key
                      ? "bg-black text-[#D4AF37]"
                      : "bg-white/5 text-[#D4AF37]/40"
                  }`}
                >
                  {option.key}
                </div>
                <span className="text-[14px] font-medium flex-1">
                  {option.text}
                </span>
                <ChevronRight className="w-4 h-4 opacity-10" />
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-[35px] p-8 text-center animate-in zoom-in">
            <Trophy className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest italic">
              Test yakunlandi
            </h3>
            <p className="text-[#D4AF37] text-3xl font-black mt-2 mb-8 tracking-tighter">
              {score} / 20
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[#D4AF37] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-[#D4AF37]/20"
            >
              Qayta boshlash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
