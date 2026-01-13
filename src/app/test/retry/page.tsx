'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { testsApi } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';

interface UserStats {
  totalTests: number;
  totalWrongAnswers: number;
  canRetryTest: boolean;
  wrongAnswersForRetry: number;
}

export default function RetryTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await testsApi.getUserStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Statistikani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRetryTest = async () => {
    setCreating(true);
    try {
      const { data } = await testsApi.createRetryTest();
      router.push(`/test/session/${data.testAttemptId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Qayta test
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Noto'g'ri javob bergan savollaringizni qayta ishlang
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center p-4">
            <Trophy className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalTests}
            </p>
            <p className="text-sm text-gray-500">Topshirgan testlar</p>
          </Card>

          <Card className="text-center p-4">
            <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalWrongAnswers}
            </p>
            <p className="text-sm text-gray-500">Noto'g'ri javoblar</p>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Qayta test haqida
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Kamida <strong>10ta test</strong> topshirgan bo'lishingiz kerak</li>
                <li>• Noto'g'ri javob bergan savollaringizdan <strong>10talik test</strong> yaratiladi</li>
                <li>• Bu test sizning bilimingizni mustahkamlashga yordam beradi</li>
                <li>• Har 10ta test topshirganingizda yangi qayta test olishingiz mumkin</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action */}
        {stats.canRetryTest ? (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Qayta test tayyor!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.wrongAnswersForRetry} ta noto'g'ri javobingiz mavjud
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateRetryTest}
              disabled={creating}
              className="w-full"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Tayyorlanmoqda...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Qayta testni boshlash
                </>
              )}
            </Button>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Hali tayyor emas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {stats.totalTests < 10
                  ? `Qayta test olish uchun yana ${10 - stats.totalTests}ta test topshiring`
                  : `Noto'g'ri javoblar yetarli emas (${stats.wrongAnswersForRetry}/10)`
                }
              </p>
              <Link href="/categories">
                <Button variant="outline">
                  Testlarni topshirish
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/profile"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Profilga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
