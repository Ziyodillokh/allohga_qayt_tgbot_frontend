'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Edit2, Trophy, Target, Zap, Clock, TrendingUp, 
  ChevronRight, Award, BarChart3, Code, Github, Instagram, Globe, Send
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { useAuthStore } from '@/store/auth';
import { usersApi, achievementsApi } from '@/lib/api';
import { Button, Card, Avatar, Badge, Progress } from '@/components/ui';
import { formatXP, calculateLevelProgress, formatDate, cn, getScoreColor, getUploadUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CategoryStat {
  id: string;
  categoryId: string;
  category: { name: string; icon: string; color: string };
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  totalXP: number;
  averageScore: number;
  bestScore: number;
}

interface TestHistory {
  id: string;
  category: { name: string; icon: string } | null;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  completedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  condition?: { type: string; value: number };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const { setUser } = useAuthStore();
  
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [achievements, setAchievements] = useState<{ unlocked: Achievement[]; locked: Achievement[] }>({
    unlocked: [],
    locked: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'developer' | 'achievements'>('stats');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        // Avval yutuqlarni tekshirib yangilash
        try {
          await achievementsApi.check();
        } catch (e) {
          console.log('Achievements check failed, continuing...');
        }

        // User profilini eng so'nggi ma'lumotlar bilan yangilash
        const [profileRes, statsRes, historyRes, achievementsRes] = await Promise.all([
          usersApi.getProfile(),
          usersApi.getCategoryStats(),
          usersApi.getTestHistory(1, 10),
          achievementsApi.getAll(), // Barcha yutuqlarni olish (progress bilan)
        ]);

        // To'liq user ma'lumotlarini yangilash (totalXP, level, avatar, etc.)
        const profileData = profileRes.data;
        if (profileData) {
          console.log('[Profile] Setting user data:', profileData);
          console.log('[Profile] Avatar from backend:', profileData.avatar);
          
          // Agar backend avatar null qaytarsa, store'dagi mavjud avatar'ni saqlab qolish
          const currentUser = useAuthStore.getState().user;
          const avatarToUse = profileData.avatar || currentUser?.avatar || null;
          console.log('[Profile] Avatar to use:', avatarToUse);
          
          setUser({
            ...profileData,
            avatar: avatarToUse,
            totalXP: profileData.totalXP ?? 0,
            level: profileData.level ?? 1,
          });
        }
        setCategoryStats(statsRes.data || []);
        
        // testHistory array ekanligini tekshirish - backend 'tests' arrayni qaytaradi
        const historyData = historyRes.data?.tests || historyRes.data?.history || historyRes.data?.data || historyRes.data;
        setTestHistory(Array.isArray(historyData) ? historyData : []);
        
        // Yutuqlarni olish - getAll() barcha yutuqlarni progress bilan qaytaradi
        const achData = achievementsRes.data;
        const achArray = Array.isArray(achData) ? achData : [];
        
        setAchievements({
          unlocked: achArray.filter((a: any) => a.unlocked || a.unlockedAt),
          locked: achArray.filter((a: any) => !a.unlocked && !a.unlockedAt),
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, updateUser]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const levelProgress = calculateLevelProgress(user.totalXP);
  const totalTests = categoryStats.reduce((sum, s) => sum + s.totalTests, 0);
  const avgScore = categoryStats.length > 0
    ? categoryStats.reduce((sum, s) => sum + s.averageScore, 0) / categoryStats.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        {/* Profile image as background with overlay text */}
        <div className="relative overflow-hidden">
          {/* Background image or gradient */}
          {user.avatar ? (
            <img 
              src={getUploadUrl(user.avatar) || undefined}
              alt={user.fullName}
              className="w-full h-auto min-h-48 max-h-96 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
          )}
          
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {user.fullName}
            </h1>
            <p className="text-white/80">@{user.username}</p>
            {user.bio && (
              <p className="text-white/70 mt-1 text-center px-4 text-sm">{user.bio}</p>
            )}
            
            <Link href="/profile/edit" className="mt-3">
              <Button variant="outline" size="sm" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                <Edit2 className="w-4 h-4 mr-2" />
                Tahrirlash
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Level Progress */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.level}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level {user.level}</p>
                  <p className="font-bold text-indigo-600">{formatXP(user.totalXP)} XP</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Keyingi levelgacha</p>
                <p className="font-medium">{formatXP(levelProgress.required - levelProgress.current)} XP</p>
              </div>
            </div>
            <Progress value={levelProgress.percentage} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Target className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
              <p className="text-xs text-gray-500">Testlar</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(avgScore)}%</p>
              <p className="text-xs text-gray-500">O'rtacha ball</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatXP(user.totalXP)}</p>
              <p className="text-xs text-gray-500">Jami XP</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Trophy className="w-6 h-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{achievements.unlocked.length}</p>
              <p className="text-xs text-gray-500">Yutuqlar</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs - Compact for mobile */}
      <div className="flex gap-1.5 sm:gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'stats', label: 'Statistika', shortLabel: 'Stat', icon: BarChart3 },
          { id: 'history', label: 'Tarix', shortLabel: 'Tarix', icon: Clock },
          { id: 'developer', label: 'Dasturchi', shortLabel: 'Dev', icon: Code },
          { id: 'achievements', label: 'Yutuqlar', shortLabel: 'Yutuq', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium whitespace-nowrap text-xs sm:text-sm transition-all',
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Kategoriya statistikasi
          </h2>
          {categoryStats.length === 0 ? (
            <Card className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500">Hali test topshirmadingiz</p>
              <Link href="/categories" className="mt-4 inline-block">
                <Button>Test boshlash</Button>
              </Link>
            </Card>
          ) : (
            categoryStats.map((stat) => (
              <Card key={stat.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
                    style={{ backgroundColor: `${stat.category.color}20` }}
                  >
                    {stat.category.icon?.startsWith('/') ? (
                      <Image 
                        src={getUploadUrl(stat.category.icon) || stat.category.icon} 
                        alt={stat.category.name} 
                        width={32} 
                        height={32}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span>{stat.category.icon || '📝'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {stat.category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stat.totalTests} ta test • {stat.totalXP} XP
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-bold', getScoreColor(stat.averageScore))}>
                      {Math.round(stat.averageScore)}%
                    </p>
                    <p className="text-xs text-gray-500">o'rtacha</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Eng yaxshi: {Math.round(stat.bestScore)}%</span>
                    <span className="text-gray-500">
                      {stat.correctAnswers}/{stat.totalQuestions} to'g'ri
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Test tarixi
          </h2>
          {testHistory.length === 0 ? (
            <Card className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500">Hali test topshirmadingiz</p>
            </Card>
          ) : (
            testHistory.map((test) => (
              <Link key={test.id} href={`/test/result/${test.id}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                      {test.category?.icon?.startsWith('/') ? (
                        <Image 
                          src={getUploadUrl(test.category.icon) || test.category.icon} 
                          alt={test.category?.name || ''} 
                          width={48} 
                          height={48}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span>{test.category?.icon || '📝'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {test.category?.name || 'Aralash test'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(test.completedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-xl font-bold', getScoreColor(test.score))}>
                        {test.score}%
                      </p>
                      <p className="text-xs text-gray-500">
                        +{test.xpEarned} XP
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Developer ID Passport */}
      {activeTab === 'developer' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5" />
            Dasturchi ID Passporti
          </h2>
          
          {/* ID Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-1">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
            <div className="relative bg-slate-900/90 rounded-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Developer ID</p>
                    <p className="text-white font-bold">BILIMDON</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">ID: #001</p>
                  <p className="text-xs text-indigo-400">✓ Verified</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex gap-6">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="w-28 h-36 rounded-lg overflow-hidden border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20">
                    <Image
                      src="/img/dev-profile.jpg"
                      alt="Developer"
                      width={112}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">To'liq ism</p>
                    <p className="text-xl font-bold text-white">Shokirjonov Bekmuhammad</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Mutaxassislik</p>
                    <p className="text-sm text-indigo-400 font-medium">Full Stack Developer (Backend Engineer)</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Stack</p>
                      <p className="text-xs text-gray-300">React, Next.js, NestJS, NodeJS, ExpressJS</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-dashed border-gray-700" />

              {/* Social Links */}
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="https://t.me/Khamidov_online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Telegram</p>
                    <p className="text-sm text-white group-hover:text-blue-400 transition-colors">@Khamidov_online</p>
                  </div>
                </a>

                <a 
                  href="https://www.instagram.com/khamidov__online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Instagram</p>
                    <p className="text-sm text-white group-hover:text-pink-400 transition-colors">@khamidov__online</p>
                  </div>
                </a>

                <a 
                  href="https://github.com/Bekmuhammad-Devoloper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                    <Github className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">GitHub</p>
                    <p className="text-sm text-white group-hover:text-gray-300 transition-colors">Bekmuhammad-Devoloper</p>
                  </div>
                </a>

                <a 
                  href="https://bekmuhammad.uz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Portfolio</p>
                    <p className="text-sm text-white group-hover:text-green-400 transition-colors">bekmuhammad.uz</p>
                  </div>
                </a>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Faol dasturchi</span>
                </div>
                <p className="text-xs text-gray-500">© 2025 Bilimdon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Unlocked */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Olingan yutuqlar ({achievements.unlocked.length})
            </h2>
            {achievements.unlocked.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-500">Hali yutuq olmadingiz</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.unlocked.map((ach) => (
                  <Card key={ach.id} className="p-4 text-center border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                    <span className="text-4xl">{ach.icon}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-2">{ach.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                    <Badge variant="success" className="mt-2">+{ach.xpReward} XP</Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Locked */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Olinmagan yutuqlar ({achievements.locked.length})
            </h2>
            {achievements.locked.length === 0 ? (
              <Card className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                <p className="text-gray-500">Barcha yutuqlarni oldingiz! 🎉</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.locked.map((ach) => {
                  const target = ach.target || 0;
                  const progress = ach.progress || 0;
                  const percentage = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
                  
                  return (
                    <Card key={ach.id} className="p-4 text-center opacity-70 hover:opacity-100 transition-opacity">
                      <span className="text-4xl grayscale">{ach.icon}</span>
                      <h3 className="font-bold text-gray-900 dark:text-white mt-2">{ach.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                      {target > 0 && (
                        <div className="mt-2">
                          <Progress value={percentage} size="sm" />
                          <p className="text-xs text-gray-500 mt-1">{progress}/{target}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
