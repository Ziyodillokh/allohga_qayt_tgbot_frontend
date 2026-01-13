import React, { useState, useEffect } from 'react';
import styles from './TestComponent.module.css';

interface TestQuestion {
  number: number;
  category: string;
  difficulty?: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
}

interface TestComponentProps {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export default function TestComponent({
  category = 'python',
  difficulty = 'easy',
}: TestComponentProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch and parse txt file based on category and difficulty
  useEffect(() => {
    const fetchAndParseQuestions = async () => {
      try {
        const response = await fetch(
          `/test/${category.toLowerCase()}/questions_${difficulty}.txt`
        );
        if (!response.ok) {
          throw new Error(`Failed to load ${category} ${difficulty} questions`);
        }
        const questionsText = await response.text();

        const lines = questionsText.split('\n');
        const parsed: TestQuestion[] = [];
        let currentQuestion: Partial<TestQuestion> = {};
        let options: { key: string; text: string }[] = [];
        let currentCategory = '';

        lines.forEach((line) => {
          line = line.trim();

          if (line.startsWith('KATEGORIYA:')) {
            const category = line
              .replace('KATEGORIYA:', '')
              .trim()
              .split('(')[0];
            currentCategory = category;
          } else if (line.startsWith('SAVOL')) {
            // Save previous question
            if (Object.keys(currentQuestion).length > 0 && options.length > 0) {
              parsed.push({
                number: currentQuestion.number || 0,
                category: currentQuestion.category || currentCategory,
                question: currentQuestion.question || '',
                options: options,
                correctAnswer: currentQuestion.correctAnswer || '',
              });
            }
            options = [];

            // Parse new question
            const match = line.match(/SAVOL (\d+):\s*(.+)/);
            if (match) {
              currentQuestion = {
                number: parseInt(match[1]),
                question: match[2],
                category: currentCategory,
              };
            }
          } else if (line.match(/^[A-D]\)\s/)) {
            const [key, ...textParts] = line.split(')');
            options.push({
              key: key.trim(),
              text: textParts.join(')').trim(),
            });
          } else if (line.startsWith('JAVOB:')) {
            currentQuestion.correctAnswer = line
              .replace('JAVOB:', '')
              .trim();
          }
        });

        // Add last question
        if (Object.keys(currentQuestion).length > 0 && options.length > 0) {
          parsed.push({
            number: currentQuestion.number || 0,
            category: currentQuestion.category || currentCategory,
            question: currentQuestion.question || '',
            options: options,
            correctAnswer: currentQuestion.correctAnswer || '',
          });
        }

        // Filter out invalid questions
        const validQuestions = parsed.filter(
          (q) =>
            q.question &&
            q.options.length === 4 &&
            q.correctAnswer &&
            q.category
        );

        console.log(`Loaded ${validQuestions.length} questions`);
        setQuestions(validQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndParseQuestions();
  }, [category, difficulty]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answerKey: string) => {
    if (!showAnswer) {
      setSelectedAnswer(answerKey);
      setShowAnswer(true);

      if (answerKey === currentQuestion.correctAnswer) {
        setScore(score + 1);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Savollar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Savollar topilmadi!</p>
        </div>
      </div>
    );
  }

  const isTestComplete = currentIndex === questions.length - 1 && showAnswer;
  const percentage = ((score / questions.length) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentQuestion.category} Testi
            </h1>
            <span className="text-lg font-semibold text-indigo-600">
              Savol {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Score: {score} / {questions.length} ({percentage}%)
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Question Text */}
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.key;
              const isCorrect = option.key === currentQuestion.correctAnswer;
              const isWrong =
                isSelected &&
                selectedAnswer !== currentQuestion.correctAnswer;

              return (
                <button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  disabled={showAnswer}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    !showAnswer
                      ? 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
                      : ''
                  } ${
                    isSelected && isWrong
                      ? 'bg-red-50 border-red-500'
                      : ''
                  } ${
                    isSelected && isCorrect
                      ? 'bg-green-50 border-green-500'
                      : ''
                  } ${
                    !isSelected && isCorrect && showAnswer
                      ? 'bg-green-50 border-green-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-lg mr-4">
                      {option.key})
                    </span>
                    <span className="text-gray-700">{option.text}</span>
                    {showAnswer && isCorrect && (
                      <span className="ml-auto text-green-600">✓</span>
                    )}
                    {showAnswer && isWrong && (
                      <span className="ml-auto text-red-600">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result Message */}
          {showAnswer && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-50 border border-green-500'
                  : 'bg-red-50 border border-red-500'
              }`}
            >
              <p
                className={`font-semibold ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {selectedAnswer === currentQuestion.correctAnswer
                  ? '✓ To\'g\'ri javob!'
                  : `✗ Noto\'g\'ri! To\'g\'ri javob: ${currentQuestion.correctAnswer}`}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            ← Oldingi
          </button>

          {!isTestComplete ? (
            <button
              onClick={handleNext}
              disabled={!showAnswer || currentIndex === questions.length - 1}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Keyingi →
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Testni Qayta Boshlash
            </button>
          )}
        </div>

        {/* Final Score */}
        {isTestComplete && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Test Tugadi!
            </h3>
            <div className="text-5xl font-bold text-indigo-600 mb-2">
              {percentage}%
            </div>
            <p className="text-gray-600 text-lg mb-4">
              {score} ta / {questions.length} ta to\'g\'ri
            </p>
            <div className="text-gray-700">
              {parseFloat(percentage) >= 80 && (
                <p className="text-green-600 font-semibold">
                  🎉 Ajoyib natija!
                </p>
              )}
              {parseFloat(percentage) >= 60 &&
                parseFloat(percentage) < 80 && (
                  <p className="text-blue-600 font-semibold">
                    👍 Yaxshi natija!
                  </p>
                )}
              {parseFloat(percentage) < 60 && (
                <p className="text-orange-600 font-semibold">
                  📚 Yana ko\'p o\'rganish kerak!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
