"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
  Home,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TestQuestion {
  id: string;
  number: number;
  category: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  xpReward: number;
}

interface Message {
  type: "bot" | "user" | "system";
  content: string;
  isCorrect?: boolean;
}

interface ChatbotQAProps {
  category?: string;
  onClose?: () => void;
}

export default function ChatbotQA({
  category = "quron",
  onClose,
}: ChatbotQAProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: string; answer: number; isCorrect: boolean }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";
  const QUESTION_COUNT = 10;

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
          `${API}/questions/random/${category.toLowerCase()}?count=${QUESTION_COUNT}`,
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Savollarni yuklashda xatolik");
        }

        const data = await response.json();

        if (data.length === 0) {
          throw new Error("Bu kategoriyada savollar mavjud emas");
        }

        setQuestions(data);
        setMessages([{ type: "bot", content: data[0].question }]);
      } catch (err: any) {
        setMessages([
          {
            type: "system",
            content:
              err.message ||
              "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [category, API]);

  const saveTestResult = async () => {
    setSaving(true);
    try {
      // Get token from Zustand store (stored in localStorage under 'tavba-auth')
      let token: string | null = null;
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("tavba-auth");
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            token = parsed.state?.token || null;
          } catch (e) {
            console.error("Error parsing auth data:", e);
          }
        }
      }

      console.log("[saveTestResult] Token found:", token ? "Yes" : "No");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("[saveTestResult] Authorization header added");
      }

      const response = await fetch(`${API}/tests/save-result`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          categorySlug: category,
          score: score,
          totalQuestions: questions.length,
          totalXP: totalXP,
          answers: answers,
        }),
      });

      const data = await response.json();
      console.log("[saveTestResult] Response:", data);

      if (!response.ok) {
        console.error("Natijani saqlashda xatolik");
      }
    } catch (error) {
      console.error("Server xatosi:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleOtherQuestions = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/test");
    }
  };

  const handleAnswerSelect = (answerKey: string) => {
    if (selectedAnswer || testComplete) return;

    const currentQ = questions[currentIndex];
    const isCorrect = answerKey === currentQ.correctAnswer;
    const selectedOpt = currentQ.options.find((o) => o.key === answerKey);
    const correctOpt = currentQ.options.find(
      (o) => o.key === currentQ.correctAnswer,
    );
    const answerIndex = answerKey.charCodeAt(0) - 65;

    setSelectedAnswer(answerKey);

    // Track answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        answer: answerIndex,
        isCorrect: isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore((s) => s + 1);
      setTotalXP((xp) => xp + (currentQ.xpReward || 10));
    }

    // Foydalanuvchi javobi va tahlil
    setMessages((prev) => [
      ...prev,
      { type: "user", content: `${answerKey}) ${selectedOpt?.text}` },
      {
        type: "system",
        content: isCorrect
          ? "To'g'ri! Barakalloh! ✓"
          : `Noto'g'ri. Javob: ${currentQ.correctAnswer}) ${correctOpt?.text}`,
        isCorrect,
      },
    ]);

    // 1.5 soniya kutib yangi savolga o'tish
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const next = currentIndex + 1;
        setCurrentIndex(next);
        setSelectedAnswer(null);
        setMessages((prev) => [
          ...prev,
          { type: "bot", content: questions[next].question },
        ]);
      } else {
        setTestComplete(true);
        // Auto-save result
        saveTestResult();
      }
    }, 1500);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center gap-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#D4AF37]/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#D4AF37]/50 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <p className="text-[#9A8866] text-sm font-medium">
          Savollar yuklanmoqda...
        </p>
      </div>
    );

  // Agar savollar bo'sh bo'lsa
  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center gap-8 p-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#D4AF37]/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-[#1A1812] border border-[#D4AF37]/20 flex items-center justify-center">
            <span className="text-5xl">📚</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white text-lg font-bold mb-2">
            Savollar mavjud emas
          </p>
          <p className="text-[#9A8866] text-sm">
            Bu kategoriyada hozircha savollar yo'q
          </p>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={handleGoHome}
            className="flex-1 py-4 bg-[#1A1812] border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#26231A] transition-colors"
          >
            <Home className="w-4 h-4" />
            Bosh sahifa
          </button>
          <button
            onClick={handleOtherQuestions}
            className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/30"
          >
            <RotateCcw className="w-4 h-4" />
            Boshqa kategoriya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-gradient-radial from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#AA8232]/10 via-transparent to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 pt-4 pb-4 bg-[#0A0908]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 safe-area-top">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                router.push("/test");
              }
            }}
            className="p-3 rounded-2xl bg-[#1A1812]/80 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all active:scale-95"
          >
            <X className="w-5 h-5 text-[#D4AF37]" />
          </button>

          <div className="text-center">
            <p className="text-[10px] font-black tracking-[0.3em] text-[#D4AF37] uppercase mb-1">
              {questions[0]?.category || "Test"}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 rounded-full bg-[#1A1812] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FBF0B2] rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-white text-xs font-bold">
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30">
            <Zap className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="text-sm font-black text-[#FBF0B2]">{score}</span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="pt-24 pb-80 px-5 max-w-lg mx-auto">
        <div className="space-y-4 min-h-[50vh]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.type === "system" ? (
                <div
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border backdrop-blur-sm ${
                    msg.isCorrect
                      ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {msg.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] px-5 py-4 ${
                    msg.type === "user"
                      ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-black rounded-3xl rounded-tr-lg font-bold shadow-lg shadow-[#D4AF37]/20"
                      : "bg-[#1A1812] border border-[#D4AF37]/10 text-[#FBF0B2] rounded-3xl rounded-tl-lg"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-10" />
        </div>
      </div>

      {/* Footer / Options */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-6 pt-4 bg-gradient-to-t from-[#0A0908] via-[#0A0908]/98 to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto">
          {!testComplete ? (
            <div className="space-y-3">
              {questions[currentIndex]?.options.map((option, optIndex) => (
                <button
                  key={option.key}
                  onClick={() => handleAnswerSelect(option.key)}
                  disabled={!!selectedAnswer}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-300 flex items-center group ${
                    selectedAnswer === option.key
                      ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black font-bold scale-[0.98] shadow-lg shadow-[#D4AF37]/30"
                      : "border-[#D4AF37]/10 bg-[#1A1812]/90 text-[#FBF0B2] hover:border-[#D4AF37]/30 hover:bg-[#1A1812] active:scale-[0.98]"
                  }`}
                  style={{ animationDelay: `${optIndex * 50}ms` }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-4 text-xs font-black transition-all ${
                      selectedAnswer === option.key
                        ? "bg-black/20 border-black/20 text-black"
                        : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37] group-hover:bg-[#D4AF37]/20"
                    }`}
                  >
                    {option.key}
                  </div>
                  <span className="text-[14px] font-medium flex-1">
                    {option.text}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-all ${selectedAnswer === option.key ? "text-black/50" : "text-[#D4AF37]/30 group-hover:text-[#D4AF37]/60 group-hover:translate-x-1"}`}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-3xl p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5"></div>

              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                  <Trophy className="w-10 h-10 text-[#D4AF37]" />
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                  Test yakunlandi!
                </h3>

                <div className="my-6">
                  <p className="text-[#D4AF37] text-5xl font-black tracking-tighter">
                    {score}
                    <span className="text-2xl text-[#D4AF37]/50">
                      /{questions.length}
                    </span>
                  </p>
                  <p className="text-[#9A8866] text-sm mt-2">
                    {Math.round((score / questions.length) * 100)}% to'g'ri
                    javob
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 mb-8">
                  <Zap className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-black text-lg">
                    +{totalXP} XP
                  </span>
                </div>

                {saving && (
                  <p className="text-[#9A8866] text-xs mb-4 animate-pulse">
                    Natija saqlanmoqda...
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleGoHome}
                    className="flex-1 py-4 bg-[#1A1812] border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 hover:bg-[#26231A] transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Yopish
                  </button>
                  <button
                    onClick={handleOtherQuestions}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#D4AF37]/40 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Yana test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
