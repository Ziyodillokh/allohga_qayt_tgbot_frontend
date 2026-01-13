'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks';
import { testsApi } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import { getUploadUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CategoryRetryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { isAuthenticated, isLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await testsApi.getStats();
        setStats(data);
      } catch (error) {
        toast.error('Statistika yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, isLoading, router]);

  const handleStartRetryTest = async () => {
    try {
      setLoading(true);
      const { data } = await testsApi.createRetryTest(categoryId);
      router.push(`/test/retry?attemptId=${data.testAttemptId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Qayta test yaratishda xatolik');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categoryRetry = stats?.categoriesForRetry?.find(
    (c: any) => c.category.id === categoryId
  );

  if (!categoryRetry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Qayta test mavjud emas
          </h2>
          <p className="text-gray-500 mb-6">
            Bu kategoriyada qayta test olish uchun 100 ta test topshiring
          </p>
          <Button onClick={() => router.push('/categories')} className="w-full">
            Kategoriyalarga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {categoryRetry.category.icon?.startsWith('/') ? (
                <Image 
                  src={getUploadUrl(categoryRetry.category.icon) || categoryRetry.category.icon}
                  alt={categoryRetry.category.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-4xl">{categoryRetry.category.icon || '📚'}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {categoryRetry.category.name} - Qayta test
            </h1>
            <p className="text-gray-500">
              Xatolaringizdan o'rganing va qaytadan sinab ko'ring
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {categoryRetry.totalTests}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami test</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {categoryRetry.wrongAnswers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Xato javob</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚡ Siz {categoryRetry.category.name} kategoriyasida {categoryRetry.totalTests} ta test topshirdingiz. 
              Endi xato qilgan savollaringizdan 10 talik qayta test topshirishingiz mumkin!
            </p>
          </div>

          <Button
            onClick={handleStartRetryTest}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Yuklanmoqda...' : 'Qayta testni boshlash'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
