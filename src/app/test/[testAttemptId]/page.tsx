"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { testsApi } from "@/lib/api";
import TestSummaryModal from "@/components/test/TestSummaryModal";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Send,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
  difficulty?: string;
  xpReward?: number;
  category?: { id: string };
}

interface TestData {
  testAttemptId: string;
  questions: TestQuestion[];
  totalQuestions: number;
  categoryName: string;
}

interface SubmitResult {
  testAttemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  results: Array<{
    questionId: string;
    question: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
    xpEarned: number;
  }>;
  levelUp?: {
    newLevel: number;
    totalXP: number;
  } | null;
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const testAttemptId = params.testAttemptId as string;

  // Timer
  useEffect(() => {
    if (testData && !submitResult) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testData, submitResult]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (testAttemptId) {
      fetchTestData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, testAttemptId]);

  const fetchTestData = async () => {
    try {
      const { data } = await testsApi.get(testAttemptId);
      setTestData(data);
      setSelectedAnswers(new Array(data.questions.length).fill(-1));
    } catch (error) {
      console.error("Failed to fetch test data:", error);
      router.push("/test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (testData && currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testData) return;

    setSubmitting(true);
    try {
      const answers = testData.questions.map((q, index) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[index],
        timeSpent: 0,
      }));

      // testsApi.submit(testId, answers) — API wraps in { answers } internally
      const { data } = await testsApi.submit(testAttemptId, answers);
      setSubmitResult(data);
      setShowSummary(true);

      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error("Failed to submit test:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    try {
      const categoryId = testData?.questions?.[0]?.category?.id;
      const { data } = await testsApi.start({
        categoryId: categoryId || undefined,
        questionsCount: testData?.totalQuestions || 10,
      });
      router.push(`/test/${data.testAttemptId}`);
    } catch {
      router.push("/test");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = selectedAnswers.filter((a) => a !== -1).length;
  const allAnswered = testData
    ? selectedAnswers.every((answer) => answer !== -1)
    : false;

  // ─── Loading State ───
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#D4AF37]/70 text-sm font-medium">
            Test yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // ─── Not Found ───
  if (!testData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-[#D4AF37]/40 mx-auto" />
          <p className="text-[#D4AF37]/60 text-lg">Test topilmadi</p>
          <button
            onClick={() => router.push("/test")}
            className="text-[#D4AF37] underline underline-offset-4 hover:text-[#FBF0B2] transition-colors"
          >
            Testlar sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ─── Detailed Results View ───
  if (showDetailedResults && submitResult) {
    return (
      <div className="max-w-2xl mx-auto pb-8">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm pb-4 pt-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/test")}
              className="flex items-center gap-1.5 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Yangi test
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] font-bold text-lg">
                {submitResult.score}%
              </span>
              <span className="text-[#D4AF37]/50 text-sm">
                ({submitResult.correctAnswers}/{submitResult.totalQuestions})
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#FBF0B2]">
            Batafsil natijalar
          </h1>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {submitResult.results.map((result, idx) => (
            <div
              key={result.questionId}
              className={`rounded-2xl border p-5 ${
                result.isCorrect
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              {/* Question number & status */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    result.isCorrect
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <p className="text-[#FBF0B2] font-medium leading-relaxed text-[15px]">
                  {result.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-11">
                {result.options.map((option, optIdx) => {
                  const isSelected = result.selectedAnswer === optIdx;
                  const isCorrect = result.correctAnswer === optIdx;
                  const isWrong = isSelected && !result.isCorrect;

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-300"
                          : isWrong
                            ? "bg-red-500/10 text-red-300"
                            : "text-[#D4AF37]/50"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isWrong ? (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <span className="text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                        )}
                      </span>
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="mt-3 ml-11 p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
                  <p className="text-xs text-[#D4AF37]/80 leading-relaxed">
                    💡 {result.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/test")}
            className="flex-1 py-3.5 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/5 transition-colors"
          >
            Bosh sahifa
          </button>
          <button
            onClick={handleRetry}
            className="flex-1 py-3.5 rounded-xl bg-[#D4AF37] text-black font-semibold hover:bg-[#D4AF37]/80 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / testData.questions.length) * 100;

  return (
    <>
      {/* Summary Modal */}
      {submitResult && (
        <TestSummaryModal
          isOpen={showSummary}
          score={submitResult.score}
          totalQuestions={submitResult.totalQuestions}
          correctAnswers={submitResult.correctAnswers}
          xpEarned={submitResult.xpEarned}
          leveledUp={!!submitResult.levelUp}
          newLevel={submitResult.levelUp?.newLevel}
          wrongAnswers={submitResult.results
            .filter((r) => !r.isCorrect)
            .map((r) => ({
              questionId: r.questionId,
              question: r.question,
              selectedAnswer: r.selectedAnswer,
              correctAnswer: r.correctAnswer,
              options: r.options,
              xpReward: r.xpEarned,
            }))}
          onContinue={() => {
            setShowSummary(false);
            setShowDetailedResults(true);
          }}
          onRetry={handleRetry}
        />
      )}

      <div className="max-w-2xl mx-auto pb-24">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              <h1 className="text-lg font-bold text-[#FBF0B2]">
                {testData.categoryName}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-[#D4AF37]/70 text-sm font-medium bg-[#D4AF37]/5 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="w-full h-2 bg-[#D4AF37]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FBF0B2] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-[#D4AF37]/50">
                Savol {currentQuestionIndex + 1} / {testData.questions.length}
              </span>
              <span className="text-xs text-[#D4AF37]/50">
                {answeredCount} ta javob berildi
              </span>
            </div>
          </div>
        </div>

        {/* ─── Question Dots (navigation) ─── */}
        <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
          {testData.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                idx === currentQuestionIndex
                  ? "bg-[#D4AF37] text-black scale-110"
                  : selectedAnswers[idx] !== -1
                    ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                    : "bg-white/5 text-[#D4AF37]/40 border border-[#D4AF37]/10"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* ─── Question Card ─── */}
        <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm rounded-3xl border border-[#D4AF37]/10 overflow-hidden mb-6">
          {/* Question Text */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-3">
              <span className="text-[#D4AF37] font-bold text-lg min-w-[32px]">
                {currentQuestionIndex + 1}.
              </span>
              <h2 className="text-[#FBF0B2] font-semibold text-[17px] leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Options */}
          <div className="px-6 pb-6 space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected =
                selectedAnswers[currentQuestionIndex] === index;
              const optionLetter = String.fromCharCode(65 + index);

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                    isSelected
                      ? "border-[#D4AF37] bg-[#D4AF37]/10"
                      : "border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected
                          ? "bg-[#D4AF37] text-black"
                          : "bg-white/5 text-[#D4AF37]/60 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]"
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span
                      className={`text-[15px] transition-colors ${
                        isSelected
                          ? "text-[#FBF0B2] font-medium"
                          : "text-[#D4AF37]/70 group-hover:text-[#D4AF37]/90"
                      }`}
                    >
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37] ml-auto flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Navigation ─── */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-[#D4AF37]/10 p-4 z-20">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            {/* Previous button */}
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="p-3 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 disabled:opacity-30 disabled:hover:border-[#D4AF37]/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Submit or Next */}
            {currentQuestionIndex === testData.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="flex-1 py-3.5 rounded-xl bg-[#D4AF37] text-black font-bold text-[15px] hover:bg-[#D4AF37]/80 disabled:opacity-40 disabled:hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Yakunlash
                    {!allAnswered && (
                      <span className="text-xs opacity-60 ml-1">
                        ({answeredCount}/{testData.questions.length})
                      </span>
                    )}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] font-semibold text-[15px] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
              >
                Keyingi
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === testData.questions.length - 1}
              className="p-3 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 disabled:opacity-30 disabled:hover:border-[#D4AF37]/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
