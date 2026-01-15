"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, ChevronRight, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

interface TestQuestion {
  number: number;
  category: string;
  difficulty?: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
}

interface ChatbotQAProps {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  onClose?: () => void;
}

interface Message {
  type: "bot" | "user";
  content: string;
  timestamp: number;
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
  const [showOptions, setShowOptions] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [messages]);

  // Fetch and parse questions
  useEffect(() => {
    const fetchAndParseQuestions = async () => {
      try {
        const response = await fetch(
          `/test/${category.toLowerCase()}/questions_${difficulty}.txt`
        );
        if (!response.ok) {
          throw new Error(`Failed to load questions`);
        }
        const questionsText = await response.text();

        const lines = questionsText.split("\n");
        const parsed: TestQuestion[] = [];
        let currentQuestion: Partial<TestQuestion> = {};
        let options: { key: string; text: string }[] = [];
        let currentCategory = "";

        lines.forEach((line) => {
          line = line.trim();

          if (line.startsWith("KATEGORIYA:")) {
            const cat = line.replace("KATEGORIYA:", "").trim().split("(")[0];
            currentCategory = cat;
          } else if (line.startsWith("SAVOL")) {
            if (Object.keys(currentQuestion).length > 0 && options.length > 0) {
              parsed.push({
                number: currentQuestion.number || 0,
                category: currentQuestion.category || currentCategory,
                question: currentQuestion.question || "",
                options: options,
                correctAnswer: currentQuestion.correctAnswer || "",
              });
            }
            options = [];

            const match = line.match(/SAVOL (\d+):\s*(.+)/);
            if (match) {
              currentQuestion = {
                number: parseInt(match[1]),
                question: match[2],
                category: currentCategory,
              };
            }
          } else if (line.match(/^[A-D]\)\s/)) {
            const [key, ...textParts] = line.split(")");
            options.push({
              key: key.trim(),
              text: textParts.join(")").trim(),
            });
          } else if (line.startsWith("JAVOB:")) {
            currentQuestion.correctAnswer = line.replace("JAVOB:", "").trim();
          }
        });

        if (Object.keys(currentQuestion).length > 0 && options.length > 0) {
          parsed.push({
            number: currentQuestion.number || 0,
            category: currentQuestion.category || currentCategory,
            question: currentQuestion.question || "",
            options: options,
            correctAnswer: currentQuestion.correctAnswer || "",
          });
        }

        const validQuestions = parsed.filter(
          (q) =>
            q.question &&
            q.options.length === 4 &&
            q.correctAnswer &&
            q.category
        );

        setQuestions(validQuestions);

        // Start with first question
        if (validQuestions.length > 0) {
          setMessages([
            {
              type: "bot",
              content: validQuestions[0].question,
              timestamp: Date.now(),
            },
          ]);
          setShowOptions(true);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setMessages([
          {
            type: "bot",
            content:
              "Savollarni yuklashda xatolik. Iltimos, qayta urinib ko'ring.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndParseQuestions();
  }, [category, difficulty]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answerKey: string) => {
    if (selectedAnswer) return; // Already answered

    setSelectedAnswer(answerKey);
    setShowOptions(false);

    // Add user message
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.key === answerKey
    );
    if (selectedOption) {
      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          content: `${answerKey}) ${selectedOption.text}`,
          timestamp: Date.now(),
        },
      ]);
    }

    // Check answer and add bot response
    const isCorrect = answerKey === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: "✓ To'g'ri javob! Yaxshi!",
            timestamp: Date.now(),
          },
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: `✗ Noto'g'ri. To'g'ri javob: ${currentQuestion.correctAnswer}`,
            timestamp: Date.now(),
          },
        ]);
      }, 500);
    }

    // Prepare next question or finish
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        const nextQ = questions[currentIndex + 1];
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: nextQ.question,
            timestamp: Date.now(),
          },
        ]);
        setShowOptions(true);
      } else {
        setTestComplete(true);
        const percentage = (
          ((isCorrect ? score + 1 : score) / questions.length) *
          100
        ).toFixed(1);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: `Test tugadi! ${percentage}% to'g'ri javob. Siz ${
              isCorrect ? score + 1 : score
            }/${questions.length} ta savolga to'g'ri javob berdingiz.`,
            timestamp: Date.now(),
          },
        ]);
      }
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setMessages([
      {
        type: "bot",
        content: questions[0]?.question || "Savollar yuklanmoqda...",
        timestamp: Date.now(),
      },
    ]);
    setShowOptions(true);
    setScore(0);
    setTestComplete(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#0F0E0A] flex flex-col p-6 overflow-hidden"
        style={{ backgroundColor: "#0F0E0A" }}
      >
        <header className="flex justify-between items-center mb-4 shrink-0">
          <button
            onClick={handleClose}
            className="p-2.5 bg-white/5 rounded-full border border-white/10 active:bg-white/10"
          >
            <X className="w-6 h-6 text-[#FBF0B2]" />
          </button>
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#FBF0B2]">
            Savollar yuklanmoqda...
          </p>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FBF0B2]"></div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#0F0E0A] flex flex-col p-6 overflow-hidden"
        style={{ backgroundColor: "#0F0E0A" }}
      >
        <header className="flex justify-between items-center mb-4 shrink-0">
          <button
            onClick={handleClose}
            className="p-2.5 bg-white/5 rounded-full border border-white/10 active:bg-white/10"
          >
            <X className="w-6 h-6 text-[#FBF0B2]" />
          </button>
          <div className="w-10"></div>
        </header>
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-[#FBF0B2]">
            <p className="text-lg font-semibold">Savollar topilmadi!</p>
          </div>
        </div>
      </div>
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

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center mb-3 shrink-0">
        <div className="flex-1 text-center">
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#FBF0B2]">
            Savol {currentIndex + 1} / {questions.length}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 bg-white/5 rounded-full border border-white/10 active:bg-white/10 hover:bg-white/10 transition-colors ml-2"
        >
          <X className="w-5 h-5 text-[#FBF0B2]" />
        </button>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 pb-4 scrollbar-hide relative z-10 flex flex-col-reverse">
        <div ref={messagesEndRef} />
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  msg.type === "user"
                    ? "bg-[#D4AF37] text-[#0F0E0A] rounded-br-none font-semibold"
                    : "bg-[#1A1812] border border-[#D4AF37]/30 text-[#FBF0B2] rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options or Final State */}
      <div className="relative z-20 space-y-3 shrink-0">
        {!testComplete && showOptions && currentQuestion && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswerSelect(option.key)}
                disabled={!!selectedAnswer}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all active:scale-95 ${
                  selectedAnswer
                    ? "opacity-50 cursor-not-allowed"
                    : "border-[#D4AF37]/30 hover:border-[#D4AF37]/60 bg-[#1A1812] hover:bg-[#26231A] text-[#FBF0B2]"
                }`}
              >
                <span className="font-bold text-[#FBF0B2]">{option.key}</span>
                <span className="ml-3 text-sm">{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {testComplete && (
          <div className="space-y-3">
            <div className="bg-[#1A1812] border border-[#D4AF37]/30 rounded-3xl p-6 text-center">
              <Trophy className="w-8 h-8 text-[#FBF0B2] mx-auto mb-3" />
              <p className="text-[#FBF0B2] text-sm font-semibold">
                Test Tugadi!
              </p>
              <p className="text-[#D4AF37] text-xs mt-2 opacity-70">
                Natija saqlandi va reytingga qo'shildi
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRestart}
                className="py-3 bg-[#D4AF37] text-[#0F0E0A] rounded-2xl text-sm font-bold hover:bg-[#FBF0B2] transition-colors active:scale-95"
              >
                Qayta Boshlash
              </button>
              <button
                onClick={handleClose}
                className="py-3 bg-white/5 border border-white/10 text-[#FBF0B2] rounded-2xl text-sm font-bold hover:bg-white/10 transition-colors active:scale-95"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
