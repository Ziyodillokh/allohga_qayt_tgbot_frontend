'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Zap, Trophy, Star, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TestSummaryProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  wrongAnswers?: Array<{
    questionId: string;
    question: string;
    selectedAnswer: number;
    correctAnswer: number;
    options: string[];
    xpReward?: number;
  }>;
  onContinue: () => void;
  onRetry?: () => void;
}

export default function TestSummaryModal({
  isOpen,
  score,
  totalQuestions,
  correctAnswers,
  xpEarned,
  leveledUp,
  newLevel,
  wrongAnswers = [],
  onContinue,
  onRetry,
}: TestSummaryProps) {
  const incorrectAnswers = totalQuestions - correctAnswers;
  const isPerfect = score === 100;
  const isGood = score >= 70;
  const isExcellent = score >= 90;

  // Confetti animation
  useEffect(() => {
    if (isOpen && score >= 70) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
        });
      }, 300);
    }
  }, [isOpen, score]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onContinue}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            {/* Header Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-center mb-8"
            >
              {isPerfect ? (
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
              ) : isExcellent ? (
                <div className="text-6xl mb-4 animate-bounce">🌟</div>
              ) : isGood ? (
                <div className="text-6xl mb-4">👏</div>
              ) : (
                <div className="text-6xl mb-4">💪</div>
              )}

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isPerfect && 'Mukammal natija!'}
                {!isPerfect && isExcellent && 'Shunchaki ajoyib!'}
                {!isPerfect && !isExcellent && isGood && 'Yaxshi natija!'}
                {!isGood && 'Davom etib yaxshilang!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Test tugadi!</p>
            </motion.div>

            {/* Score Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${score * 3.52} 352`}
                  strokeLinecap="round"
                  className={
                    score >= 90
                      ? 'text-green-500'
                      : score >= 70
                        ? 'text-blue-500'
                        : score >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                  }
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{ strokeDasharray: `${score * 3.52} 352` }}
                  transition={{ delay: 0.4, duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-bold text-gray-900 dark:text-white"
                >
                  {score}%
                </motion.span>
                <span className="text-sm text-gray-500">natija</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              {/* Correct Answers */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                </motion.div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {correctAnswers}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">To'g'ri</p>
              </div>

              {/* Wrong Answers */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.65, type: 'spring' }}
                >
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                </motion.div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {incorrectAnswers}
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">Noto'g'ri</p>
              </div>

              {/* XP Earned */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                >
                  <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                </motion.div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  +{xpEarned}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">XP</p>
              </div>
            </motion.div>

            {/* Level Up Alert */}
            {leveledUp && newLevel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-8 text-white text-center"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-3xl mb-2"
                >
                  ⭐
                </motion.div>
                <p className="font-bold mb-1">Level Up!</p>
                <p className="text-sm opacity-90">Siz Level {newLevel} ga ko'tarildingiz!</p>
              </motion.div>
            )}

            {/* Wrong Answers Section */}
            {wrongAnswers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.82 }}
                className="mb-6 max-h-48 overflow-y-auto"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Notog'ri javoblar ({wrongAnswers.length})
                </h3>
                <div className="space-y-2">
                  {wrongAnswers.map((wrong, idx) => (
                    <div
                      key={wrong.questionId}
                      className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm"
                    >
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {idx + 1}. {wrong.question}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="text-red-700 dark:text-red-400">
                          ❌ Sizning javob: <span className="font-semibold">{wrong.options[wrong.selectedAnswer]}</span>
                        </p>
                        <p className="text-green-700 dark:text-green-400">
                          ✓ To'g'ri javob: <span className="font-semibold">{wrong.options[wrong.correctAnswer]}</span>
                        </p>
                        {wrong.xpReward && (
                          <p className="text-yellow-600 dark:text-yellow-400 mt-1">
                            💡 Imkoniyat: +{wrong.xpReward} XP
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Continue & Retry Buttons */}
            <div className="flex gap-3">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.84 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                Natijalar
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              {onRetry && wrongAnswers.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.86 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRetry}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  🔄 Qayta
                </motion.button>
              )}
            </div>

            {/* Hint text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Javoblarni batafsil ko'rish uchun natija sahifasini o'qing
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
