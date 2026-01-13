'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowLeft, Share2, RotateCcw, Trophy, Zap, Star, X, Copy, MessageCircle, Send } from 'lucide-react';
import { testsApi } from '@/lib/api';
import { Button, Card, Badge, Progress } from '@/components/ui';
import { cn, getScoreColor, getDifficultyColor, getDifficultyLabel, formatXP } from '@/lib/utils';
import { telegramHaptic, isTelegramWebApp } from '@/lib/telegram';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

interface TestResult {
  id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number | null;
  leveledUp: boolean;
  newLevel: number | null;
  newAchievements: Array<{ id: string; name: string; icon: string; xpReward: number }>;
  answers: Array<{
    questionId: string;
    question: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string | null;
    xpReward: number;
  }>;
}

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await testsApi.getResult(testId);
        
        // Backend'dan kelgan testAnswers'ni answers formatiga o'tkazish
        const answers = data.testAnswers?.map((ta: any) => ({
          questionId: ta.question.id,
          question: ta.question.question,
          options: ta.question.options,
          selectedAnswer: ta.selectedAnswer,
          correctAnswer: ta.question.correctAnswer,
          isCorrect: ta.isCorrect,
          explanation: ta.question.explanation,
          xpReward: ta.xpEarned || 0,
        })) || [];
        
        setResult({
          ...data,
          answers,
        });

        // Celebration for good scores
        if (data.score >= 80) {
          if (isTelegramWebApp()) {
            telegramHaptic('success');
          }
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (error: any) {
        toast.error('Natijani yuklashda xatolik');
        router.push('/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, router]);

  const handleShare = () => {
    if (!result) return;
    setShowShareModal(true);
  };

  const shareText = result ? `🎓 Bilimdon platformasida ${result.score}% natija oldim! ${result.correctAnswers}/${result.totalQuestions} to'g'ri javob, ${result.xpEarned} XP qo'lga kiritdim. Sen ham sinab ko'r!` : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bilimdon.uz';

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success('Matn nusxalandi!');
    setShowShareModal(false);
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bilimdon - Test natijasi',
          text: shareText,
          url: shareUrl,
        });
        setShowShareModal(false);
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Natija topilmadi</p>
      </div>
    );
  }

  const scoreColor = getScoreColor(result.score);
  const isPerfect = result.score === 100;
  const isGood = result.score >= 70;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-8">
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Yopish"
              aria-label="Modalni yopish"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Natijani ulashish
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleTelegramShare}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white transition-colors"
              >
                <Send className="w-6 h-6" />
                <span className="font-medium">Telegram</span>
              </button>
              
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={handleCopyText}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <Copy className="w-6 h-6" />
                <span className="font-medium">Matnni nusxalash</span>
              </button>
              
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                  <span className="font-medium">Boshqa ilovalar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-8 sm:py-12 px-4">
        <div className="container mx-auto text-center">
          {/* Score Circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${result.score * 4.4} 440`}
                strokeLinecap="round"
                className="text-white"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold">{result.score}%</span>
              <span className="text-white/80 text-xs sm:text-sm">natija</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
            {isPerfect ? '🎉 Mukammal!' : isGood ? '👏 Yaxshi natija!' : '💪 Davom eting!'}
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            {result.correctAnswers} / {result.totalQuestions} to'g'ri javob
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-4 sm:-mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="text-center p-3 sm:p-4">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-yellow-500 mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              +{result.xpEarned}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">XP olindi</p>
          </Card>

          <Card className="text-center p-3 sm:p-4">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-green-500 mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {result.correctAnswers}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">To'g'ri</p>
          </Card>

          <Card className="text-center p-3 sm:p-4">
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-500 mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Noto'g'ri</p>
          </Card>

          <Card className="text-center p-3 sm:p-4">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-purple-500 mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {result.score >= 90 ? 'A' : result.score >= 70 ? 'B' : result.score >= 50 ? 'C' : 'D'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Baho</p>
          </Card>
        </div>

        {/* Level Up Alert */}
        {result.leveledUp && result.newLevel && (
          <Card className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 animate-bounce" />
            <h3 className="text-xl font-bold mb-1">🎊 Level Up!</h3>
            <p>Siz Level {result.newLevel} ga ko'tarildingiz!</p>
          </Card>
        )}

        {/* New Achievements */}
        {(Array.isArray(result.newAchievements) && result.newAchievements.length > 0) && (
          <Card className="mt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              🏆 Yangi yutuqlar
            </h3>
            <div className="space-y-3">
              {result.newAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <span className="text-3xl">{ach.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{ach.name}</p>
                    <p className="text-sm text-yellow-600">+{ach.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link href="/categories">
            <Button variant="outline" className="w-full text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              Kategoriyalar
            </Button>
          </Link>
          <Button onClick={handleShare} variant="secondary" className="w-full text-sm sm:text-base">
            <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
            Ulashish
          </Button>
        </div>

        {/* Show/Hide Answers */}
        {Array.isArray(result.answers) && result.answers.filter(a => !a.isCorrect).length > 0 && (
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="w-full mt-6 py-3 text-indigo-600 dark:text-indigo-400 font-medium"
          >
            {showAnswers ? 'Xatolarni yashirish' : `Xatolarni ko'rish (${result.answers.filter(a => !a.isCorrect).length} ta)`}
          </button>
        )}

        {/* Wrong Answers Review - faqat noto'g'ri javoblar */}
        {showAnswers && Array.isArray(result.answers) && (
          <div className="space-y-4 mt-4 pb-8">
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">
              ❌ Noto'g'ri javoblar
            </h3>
            {result.answers
              .map((answer, originalIndex) => ({ ...answer, originalIndex: originalIndex + 1 }))
              .filter(answer => !answer.isCorrect)
              .map((answer) => (
              <Card key={answer.questionId} className="border-l-4 border-l-red-500">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Savol {answer.originalIndex}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {answer.question}
                    </p>
                  </div>
                </div>

                {/* Faqat tanlangan noto'g'ri javob va to'g'ri javobni ko'rsatish */}
                <div className="space-y-2 mb-4">
                  {/* Sizning javobingiz - noto'g'ri */}
                  <div className="p-3 rounded-xl flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm bg-red-500 text-white">
                      {['A', 'B', 'C', 'D'][answer.selectedAnswer]}
                    </span>
                    <span className="flex-1 text-red-700 dark:text-red-400">
                      {answer.options[answer.selectedAnswer]}
                    </span>
                    <span className="text-xs text-red-500 font-medium">Sizning javobingiz</span>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>

                  {/* To'g'ri javob */}
                  <div className="p-3 rounded-xl flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm bg-green-500 text-white">
                      {['A', 'B', 'C', 'D'][answer.correctAnswer]}
                    </span>
                    <span className="flex-1 text-green-700 dark:text-green-400 font-medium">
                      {answer.options[answer.correctAnswer]}
                    </span>
                    <span className="text-xs text-green-500 font-medium">To'g'ri javob</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>

                {answer.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Tushuntirish:</strong> {answer.explanation}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
