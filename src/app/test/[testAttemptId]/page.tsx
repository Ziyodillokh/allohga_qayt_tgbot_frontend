"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { testsApi } from "@/lib/api";
import { Card, Button, Progress } from "@/components/ui";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface TestData {
  testAttemptId: string;
  questions: TestQuestion[];
  categoryName: string;
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const testAttemptId = params.testAttemptId as string;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (testAttemptId) {
      fetchTestData();
    }
  }, [isAuthenticated, authLoading, testAttemptId, router]);

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

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (testData?.questions.length || 0) - 1) {
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
        timeSpent: 0, // TODO: track time
      }));

      await testsApi.submitTest(testAttemptId, {
        answers,
      });

      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit test:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!testData) return 0;
    let correct = 0;
    testData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) correct++;
    });
    return correct;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#D4AF37]/60">Test topilmadi</p>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / testData.questions.length) * 100;
  const allAnswered = selectedAnswers.every((answer) => answer !== -1);

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / testData.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
          </div>

          <h1 className="text-2xl font-bold text-[#FBF0B2] mb-2">
            Test Yakunlandi!
          </h1>

          <div className="space-y-4 mb-6">
            <div className="text-4xl font-bold text-[#D4AF37]">
              {score}/{testData.questions.length}
            </div>
            <div className="text-lg text-[#D4AF37]/80">
              {percentage.toFixed(1)}% to'g'ri
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/test")} variant="outline">
              Yangi test
            </Button>
            <Button onClick={() => router.push("/profile")} variant="default">
              Profilingiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#FBF0B2]">
          {testData.categoryName} Testi
        </h1>
        <div className="flex items-center gap-2 text-[#D4AF37]/60">
          <Clock className="w-4 h-4" />
          <span>
            {currentQuestionIndex + 1}/{testData.questions.length}
          </span>
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#FBF0B2]">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#FBF0B2]"
                    : "border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#D4AF37]/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? "border-[#D4AF37] bg-[#D4AF37]"
                        : "border-[#D4AF37]/60"
                    }`}
                  />
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Oldingi
        </Button>

        {currentQuestionIndex === testData.questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/80"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Yakunlash
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
          >
            Keyingi
          </Button>
        )}
      </div>
    </div>
  );
}
