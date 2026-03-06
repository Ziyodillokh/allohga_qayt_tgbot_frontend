"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { categoriesApi, testsApi } from "@/lib/api";
import { Card, Button, Badge } from "@/components/ui";
import { BookOpen, Play, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export default function TestPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTest, setStartingTest] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchCategories();
  }, [isAuthenticated, authLoading, router]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (category: Category) => {
    setStartingTest(category.slug);
    try {
      const { data } = await testsApi.start({
        categoryId: category.id,
        questionsCount: 10,
      });
      // Navigate to test with attempt id
      router.push(`/test/${data.testAttemptId}`);
    } catch (error) {
      console.error("Failed to start test:", error);
      setStartingTest(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#FBF0B2] mb-2">
          Bilim Testlari
        </h1>
        <p className="text-[#D4AF37]/80">
          Kategoriyani tanlang va bilim testini boshlang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#FBF0B2]">
                    {category.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.slug}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#D4AF37]/70 mb-4 line-clamp-2">
              {category.description}
            </p>

            <Button
              onClick={() => startTest(category)}
              disabled={startingTest === category.slug}
              className="w-full"
              variant="default"
            >
              {startingTest === category.slug ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Testni boshlash
            </Button>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
          <p className="text-[#D4AF37]/60">Kategoriyalar topilmadi</p>
        </div>
      )}
    </div>
  );
}
