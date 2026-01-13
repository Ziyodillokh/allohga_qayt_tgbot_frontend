"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth, useCategories } from "@/hooks";
import { testsApi } from "@/lib/api";
import { Button, Card, Progress, Badge } from "@/components/ui";
import { cn, getDifficultyColor, getDifficultyLabel } from "@/lib/utils";
import { telegramHaptic, isTelegramWebApp } from "@/lib/telegram";
import toast from "react-hot-toast";
import { Category } from "@/types";

interface Question {
  id: string;
  question: string;
  options: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  levelIndex?: number;
  xpReward: number;
}

interface Answer {
  questionId: string;
  selectedAnswer: number;
}

// Helper function to get difficulty label from category's difficultyLevels array or default
function getCategoryDifficultyLabel(
  question: Question,
  category?: Category
): string {
  // Agar kategoriyada difficultyLevels array bo'lsa va savolda levelIndex bo'lsa
  if (category?.difficultyLevels && question.levelIndex !== undefined) {
    const label = category.difficultyLevels[question.levelIndex];
    if (label) return label;
  }
  // Aks holda default label qaytaramiz
  return getDifficultyLabel(question.difficulty);
}

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testAttemptId, setTestAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const category = categories.find((c) => c.slug === slug);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  );
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.length;

  // Start test
  useEffect(() => {
    if (authLoading) return;

    const startTest = async () => {
      try {
        setLoading(true);
        const categoryId = slug === "mixed" ? undefined : category?.id;

        const { data } = await testsApi.start({
          categoryId,
          questionsCount: 10,
        });

        setTestAttemptId(data.testAttemptId);
        setQuestions(data.questions);
        setTimeLeft(600); // 10 minutes
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Test boshlashda xatolik");
        router.push("/categories");
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [isAuthenticated, authLoading, slug, category?.id, router]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (!currentQuestion) return;

      if (isTelegramWebApp()) {
        telegramHaptic("impact");
      }

      setAnswers((prev) => {
        const existing = prev.findIndex(
          (a) => a.questionId === currentQuestion.id
        );
        if (existing !== -1) {
          const newAnswers = [...prev];
          newAnswers[existing] = {
            questionId: currentQuestion.id,
            selectedAnswer: optionIndex,
          };
          return newAnswers;
        }
        return [
          ...prev,
          { questionId: currentQuestion.id, selectedAnswer: optionIndex },
        ];
      });
    },
    [currentQuestion]
  );

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Submit test
  const handleSubmit = async () => {
    if (!testAttemptId || submitting) return;

    // Check if all questions answered
    if (answers.length < questions.length) {
      const confirm = window.confirm(
        `Siz hali ${
          questions.length - answers.length
        } ta savolga javob bermadingiz. Yuborishni xohlaysizmi?`
      );
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      await testsApi.submit(testAttemptId, answers);

      if (isTelegramWebApp()) {
        telegramHaptic("success");
      }

      router.push(`/test/result/${testAttemptId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Testni yuborishda xatolik");
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Test yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Testdan chiqishni xohlaysizmi? Natijalar saqlanmaydi."
                    )
                  ) {
                    router.push("/categories");
                  }
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Orqaga qaytish"
                aria-label="Orqaga qaytish"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">
                  {slug === "mixed" ? "Aralash test" : category?.name || "Test"}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentIndex + 1} / {questions.length}
                </p>
              </div>
            </div>

            {timeLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium",
                  timeLeft < 60
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress */}
          <Progress value={progress} size="sm" className="mt-3" />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="container mx-auto px-4 py-6">
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                {getCategoryDifficultyLabel(currentQuestion, category)}
              </Badge>
              <Badge variant="info">+{currentQuestion.xpReward} XP</Badge>
            </div>

            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              {currentQuestion.question}
            </h2>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedAnswer === index;
              const labels = ["A", "B", "C", "D"];

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={cn(
                    "w-full p-4 rounded-2xl text-left transition-all duration-200 border-2",
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-lg"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {labels[index]}
                    </div>
                    <span
                      className={cn(
                        "flex-1",
                        isSelected
                          ? "text-indigo-900 dark:text-indigo-100 font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Question Navigator */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3">Savollar:</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers.some((a) => a.questionId === q.id);
                const isCurrent = index === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={cn(
                      "w-10 h-10 rounded-xl font-medium text-sm transition-all",
                      isCurrent
                        ? "bg-indigo-600 text-white scale-110"
                        : isAnswered
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 md:p-4 md:relative md:border-t-0 md:mt-8 z-50">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            size="sm"
            className="px-2 md:px-4"
          >
            <ArrowLeft className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Oldingi</span>
          </Button>

          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {answeredCount}/{questions.length}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Keyingi tugmasi - oxirgi savol bo'lmasa va barcha javob berilmagan */}
            {currentIndex < questions.length - 1 &&
              answeredCount < questions.length && (
                <Button onClick={goToNext} size="sm" className="px-2 md:px-4">
                  <span className="hidden md:inline">Keyingi</span>
                  <ArrowRight className="w-4 h-4 md:ml-2" />
                </Button>
              )}

            {/* Yakunlash tugmasi - barcha savollar javob berilganda YOKI oxirgi savolda */}
            {(answeredCount === questions.length ||
              currentIndex === questions.length - 1) && (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700 px-3 md:px-4"
              >
                Yakunlash
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
