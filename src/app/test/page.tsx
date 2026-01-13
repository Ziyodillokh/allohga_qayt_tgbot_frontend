'use client';

import { useState } from 'react';
import TestComponent from '@/components/test/TestComponent';

export default function TestPage() {
  const [selectedCategory, setSelectedCategory] = useState('python');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'easy' | 'medium' | 'hard'
  >('easy');
  const [isTestStarted, setIsTestStarted] = useState(false);

  const categories = [
    { name: 'python', label: 'Python' },
    { name: 'javascript', label: 'JavaScript' },
    { name: 'react', label: 'React' },
    { name: 'typescript', label: 'TypeScript' },
    { name: 'database', label: 'Database' },
    { name: 'web', label: 'Web Fundamentals' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Oson (Easy)' },
    { value: 'medium', label: "O'rta (Medium)" },
    { value: 'hard', label: 'Murakkab (Hard)' },
  ];

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            📚 Bilimdon Test Platformasi
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Test Kategoriyasini Tanlang
            </h2>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Kategoriya:
              </label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Qiyinlik Darajasi:
              </label>
              <div className="grid grid-cols-3 gap-4">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value as any)}
                    className={`p-4 rounded-lg font-semibold transition-all ${
                      selectedDifficulty === diff.value
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setIsTestStarted(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-lg"
            >
              🚀 Testni Boshlash
            </button>

            {/* Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                ✅ <strong>20+ savol</strong> har qiyinlik darajasi uchun
              </p>
              <p className="text-sm text-gray-700">
                ⏱️ <strong>Vaqt cheklanmagan</strong> - ozboshimchalik bilan ishlang
              </p>
              <p className="text-sm text-gray-700">
                📊 <strong>Real-time scoring</strong> - natijalarni darhol bilib oling
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => setIsTestStarted(false)}
          className="mb-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          ← Orqaga Qaytish
        </button>
        <TestComponent category={selectedCategory} difficulty={selectedDifficulty} />
      </div>
    </div>
  );
}
