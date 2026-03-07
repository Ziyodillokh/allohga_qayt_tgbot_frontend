"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Trophy,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
  Home,
  RotateCcw,
  Timer,
  Brain,
  Flame,
  Star,
  ArrowLeft,
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
  categoryName?: string;
  onClose?: () => void;
}

export default function ChatbotQA({
  category = "quron",
  categoryName,
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
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";
  const QUESTION_COUNT = 10;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Timer
  useEffect(() => {
    if (!loading && !testComplete) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, testComplete]);

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
        setMessages([
          {
            type: "bot",
            content: `Assalomu alaykum! 📚 ${categoryName || data[0]?.category || "Imtihon"} bo'limidan ${data.length} ta savol tayyorladim. Boshlaylik!`,
          },
          { type: "bot", content: data[0].question },
        ]);
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
  }, [category, API, categoryName]);

  const saveTestResult = async () => {
    setSaving(true);
    try {
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

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API}/tests/save-result`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          categorySlug: category,
          score,
          totalQuestions: questions.length,
          totalXP,
          answers,
        }),
      });
    } catch (error) {
      console.error("Natijani saqlashda xatolik:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setMessages([]);
    setSelectedAnswer(null);
    setScore(0);
    setTotalXP(0);
    setTestComplete(false);
    setAnswers([]);
    setStreak(0);
    setShowResult(false);
    setTimeElapsed(0);
    setLoading(true);

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${API}/questions/random/${category.toLowerCase()}?count=${QUESTION_COUNT}`,
        );
        const data = await response.json();
        if (data.length === 0) throw new Error("Savollar yo'q");
        setQuestions(data);
        setMessages([
          { type: "bot", content: "Yangi savollar tayyorlandi! 🔄 Boshlaylik!" },
          { type: "bot", content: data[0].question },
        ]);
      } catch {
        setMessages([{ type: "system", content: "Savollarni yuklashda xatolik" }]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
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

    setAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, answer: answerIndex, isCorrect },
    ]);

    if (isCorrect) {
      setScore((s) => s + 1);
      setTotalXP((xp) => xp + (currentQ.xpReward || 10));
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", content: `${answerKey}) ${selectedOpt?.text}` },
      {
        type: "system",
        content: isCorrect
          ? `✅ To'g'ri! Barakalloh! +${currentQ.xpReward || 10} XP`
          : `❌ Noto'g'ri. To'g'ri javob: ${currentQ.correctAnswer}) ${correctOpt?.text}`,
        isCorrect,
      },
    ]);

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
        saveTestResult();
      }
    }, 1200);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const percentage = questions.length
    ? Math.round((score / questions.length) * 100)
    : 0;

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center gap-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#D4AF37]/10 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-[#D4AF37] animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-[#D4AF37] text-sm font-bold mb-1">
            Savollar tayyorlanmoqda...
          </p>
          <p className="text-[#9A8866] text-xs">
            {categoryName || category}
          </p>
        </div>
      </div>
    );
  }

  // No questions
  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex flex-col items-center justify-center gap-8 p-6">
        <div className="w-24 h-24 rounded-3xl bg-[#1E1C18] border border-[#D4AF37]/20 flex items-center justify-center">
          <span className="text-5xl">📚</span>
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
            className="flex-1 py-4 bg-[#1E1C18] border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Bosh sahifa
          </button>
          <button
            onClick={handleOtherQuestions}
            className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-2xl font-black flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Boshqa kategoriya
          </button>
        </div>
      </div>
    );
  }

  // Test completed — Results screen
  if (testComplete) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-gradient-radial from-[#D4AF37]/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-[-5%] left-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#AA8232]/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-5 py-8">
          {/* Back button */}
          <button
            onClick={handleOtherQuestions}
            className="mb-6 p-3 rounded-2xl bg-[#1E1C18]/80 border border-[#D4AF37]/10"
          >
            <ArrowLeft className="w-5 h-5 text-[#D4AF37]" />
          </button>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-[#1E1C18] to-[#0F0E0A] border border-[#D4AF37]/30 rounded-3xl p-8 text-center relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5" />

            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5 border border-[#D4AF37]/30">
                <Trophy className="w-12 h-12 text-[#D4AF37]" />
              </div>

              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                Test yakunlandi!
              </h2>
              <p className="text-[#9A8866] text-sm mb-6">
                {categoryName || questions[0]?.category || "Imtihon"}
              </p>

              <div className="mb-6">
                <p className="text-[#D4AF37] text-6xl font-black tracking-tighter">
                  {score}
                  <span className="text-3xl text-[#D4AF37]/50">
                    /{questions.length}
                  </span>
                </p>
                <p className="text-[#9A8866] text-sm mt-2">
                  {percentage}% to'g'ri javob
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <Zap className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                  <p className="text-lg font-black text-[#D4AF37]">+{totalXP}</p>
                  <p className="text-[9px] text-[#9A8866] uppercase">XP</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                  <Timer className="w-5 h-5 text-[#3b82f6] mx-auto mb-1" />
                  <p className="text-lg font-black text-[#3b82f6]">{formatTime(timeElapsed)}</p>
                  <p className="text-[9px] text-[#9A8866] uppercase">Vaqt</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                  <Star className="w-5 h-5 text-[#22c55e] mx-auto mb-1" />
                  <p className="text-lg font-black text-[#22c55e]">{percentage}%</p>
                  <p className="text-[9px] text-[#9A8866] uppercase">Aniqlik</p>
                </div>
              </div>

              {saving && (
                <p className="text-[#9A8866] text-xs mb-4 animate-pulse">
                  Natija saqlanmoqda...
                </p>
              )}
            </div>
          </div>

          {/* Answer Details */}
          <div className="mb-6">
            <button
              onClick={() => setShowResult(!showResult)}
              className="w-full p-4 rounded-2xl bg-[#1E1C18] border border-[#D4AF37]/20 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-[#D4AF37]">
                Javoblar tafsiloti
              </span>
              <ChevronRight
                className={`w-5 h-5 text-[#D4AF37]/50 transition-transform ${showResult ? "rotate-90" : ""}`}
              />
            </button>

            {showResult && (
              <div className="mt-3 space-y-2">
                {answers.map((ans, i) => {
                  const q = questions[i];
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${
                        ans.isCorrect
                          ? "bg-[#22c55e]/5 border-[#22c55e]/20"
                          : "bg-[#ef4444]/5 border-[#ef4444]/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            ans.isCorrect ? "bg-[#22c55e]/20" : "bg-[#ef4444]/20"
                          }`}
                        >
                          {ans.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#ef4444]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 line-clamp-2">
                            {q?.question}
                          </p>
                          {!ans.isCorrect && (
                            <p className="text-[10px] text-[#22c55e] mt-1">
                              Javob: {q?.correctAnswer}){" "}
                              {q?.options.find((o) => o.key === q.correctAnswer)?.text}
                            </p>
                          )}
                        </div>
                        {ans.isCorrect && (
                          <span className="text-[10px] text-[#D4AF37] font-bold">
                            +{q?.xpReward || 10}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-4 bg-[#1E1C18] border border-[#D4AF37]/30 text-[#D4AF37] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              Qayta test
            </button>
            <button
              onClick={handleOtherQuestions}
              className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-[#D4AF37]/30"
            >
              <ChevronRight className="w-4 h-4" />
              Boshqa test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main test UI
  return (
    <div className="min-h-screen bg-[#0F0D0A] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-gradient-radial from-[#D4AF37]/12 via-[#D4AF37]/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[300px] h-[300px] bg-gradient-radial from-[#AA8232]/8 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-3 bg-[#0F0D0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10 safe-area-top">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => (onClose ? onClose() : router.push("/test"))}
              className="p-2.5 rounded-xl bg-[#1E1C18]/80 border border-[#D4AF37]/10 active:scale-95 transition-transform"
            >
              <X className="w-5 h-5 text-[#D4AF37]" />
            </button>

            <div className="text-center">
              <p className="text-[9px] font-black tracking-[0.3em] text-[#D4AF37] uppercase">
                IMTIHON
              </p>
              <p className="text-white text-xs font-bold">
                {currentIndex + 1} / {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1E1C18]/80 border border-[#D4AF37]/10">
                <Timer className="w-3 h-3 text-[#9A8866]" />
                <span className="text-[11px] font-mono text-[#9A8866]">
                  {formatTime(timeElapsed)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30">
                <Zap className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-black text-[#FBF0B2]">
                  {score}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[#1E1C18] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FBF0B2] rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Streak indicator */}
          {streak >= 2 && (
            <div className="flex items-center justify-center gap-1 mt-1.5">
              <Flame className="w-3.5 h-3.5 text-[#f97316]" />
              <span className="text-[10px] font-bold text-[#f97316]">
                {streak}x ketma-ket to'g'ri!
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div
        className={`${streak >= 2 ? "pt-[120px]" : "pt-[100px]"} pb-80 px-4 max-w-lg mx-auto`}
      >
        <div className="space-y-3 min-h-[50vh]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.type === "system" ? (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border ${
                    msg.isCorrect
                      ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                      : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
                  }`}
                >
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] px-4 py-3.5 ${
                    msg.type === "user"
                      ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8232] text-black rounded-2xl rounded-tr-md font-bold shadow-lg shadow-[#D4AF37]/20"
                      : "bg-[#1E1C18] border border-[#D4AF37]/10 text-[#FBF0B2] rounded-2xl rounded-tl-md"
                  }`}
                >
                  <p className="text-[14px] leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Answer Options */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0F0D0A] via-[#0F0D0A]/98 to-transparent safe-area-bottom">
        <div className="max-w-lg mx-auto space-y-2.5">
          {questions[currentIndex]?.options.map((option, optIndex) => {
            const isSelected = selectedAnswer === option.key;
            const isCorrectAnswer =
              selectedAnswer && option.key === questions[currentIndex].correctAnswer;
            const isWrongSelected =
              isSelected && option.key !== questions[currentIndex].correctAnswer;

            return (
              <button
                key={option.key}
                onClick={() => handleAnswerSelect(option.key)}
                disabled={!!selectedAnswer}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-300 flex items-center group ${
                  isWrongSelected
                    ? "border-[#ef4444]/50 bg-[#ef4444]/10 scale-[0.98]"
                    : isCorrectAnswer
                      ? "border-[#22c55e]/50 bg-[#22c55e]/10 scale-[0.98]"
                      : isSelected
                        ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#AA8232] text-black scale-[0.98]"
                        : "border-[#D4AF37]/10 bg-[#1E1C18]/90 text-[#FBF0B2] hover:border-[#D4AF37]/30 active:scale-[0.98]"
                }`}
                style={{ animationDelay: `${optIndex * 40}ms` }}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center mr-3 text-xs font-black transition-all ${
                    isWrongSelected
                      ? "bg-[#ef4444]/20 border-[#ef4444]/30 text-[#ef4444]"
                      : isCorrectAnswer
                        ? "bg-[#22c55e]/20 border-[#22c55e]/30 text-[#22c55e]"
                        : isSelected
                          ? "bg-black/20 border-black/20 text-black"
                          : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
                  }`}
                >
                  {isWrongSelected ? (
                    <XCircle className="w-4 h-4" />
                  ) : isCorrectAnswer ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    option.key
                  )}
                </div>
                <span className="text-[13px] font-medium flex-1">
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
