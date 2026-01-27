"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Star, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks";
import { achievementsApi } from "@/lib/api";
import { Card, Badge, Progress } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [achievements, setAchievements] = useState<{
    unlocked: Achievement[];
    locked: Achievement[];
  }>({ unlocked: [], locked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // getAll barcha yutuqlarni progress bilan qaytaradi
        const { data } = await achievementsApi.getAll();
        const achievementsList = Array.isArray(data) ? data : [];

        setAchievements({
          unlocked: achievementsList.filter((a: Achievement) => a.unlockedAt),
          locked: achievementsList.filter((a: Achievement) => !a.unlockedAt),
        });
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAchievements();
    }
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalXPEarned = achievements.unlocked.reduce(
    (sum, a) => sum + a.xpReward,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏆 Yutuqlar
          </h1>
          <p className="text-gray-500">
            {achievements.unlocked.length}/
            {achievements.unlocked.length + achievements.locked.length} olingan
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {achievements.unlocked.length}
          </p>
          <p className="text-sm text-gray-500">Olingan yutuqlar</p>
        </Card>
        <Card className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <Star className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            +{totalXPEarned}
          </p>
          <p className="text-sm text-gray-500">XP yutuqlardan</p>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Olingan yutuqlar
        </h2>

        {achievements.unlocked.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">Hali yutuq olmadingiz</p>
            <Link
              href="/categories"
              className="mt-4 inline-block text-indigo-600 hover:underline"
            >
              Test topshirib boshlang в†’
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.unlocked.map((achievement) => (
              <Card
                key={achievement.id}
                className="p-4 border-2 border-yellow-200 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-900"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success">
                        +{achievement.xpReward} XP
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {achievement.unlockedAt &&
                          new Date(achievement.unlockedAt).toLocaleDateString(
                            "uz-UZ",
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Locked Achievements */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Olinmagan yutuqlar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.locked.map((achievement) => (
            <Card key={achievement.id} className="p-4 opacity-75">
              <div className="flex items-start gap-4">
                <div className="text-4xl grayscale">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300">
                    {achievement.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {achievement.description}
                  </p>

                  {achievement.progress !== undefined && achievement.target && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                      <Progress
                        value={
                          (achievement.progress / achievement.target) * 100
                        }
                        size="sm"
                        variant="default"
                      />
                    </div>
                  )}

                  <Badge variant="outline" className="mt-2">
                    +{achievement.xpReward} XP
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
