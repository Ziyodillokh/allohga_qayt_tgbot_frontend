"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks";
import { Card, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#D4AF37]/60 text-sm">Kategoriyalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#D4AF37]/60">Kategoriyalar yuklanmadi</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#FBF0B2] mb-2">
          Bilim Kategoriyalari
        </h1>
        <p className="text-[#D4AF37]/80">
          O'zingizga mos kategoriyani tanlang va bilim testini boshlang
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]/60 w-4 h-4" />
          <Input
            type="text"
            placeholder="Kategoriya qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1a1a1a] border-[#D4AF37]/30 text-[#FBF0B2] placeholder-[#D4AF37]/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color || '#6366f1' }}
                >
                  <span className="text-lg font-bold">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#FBF0B2]">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.slug}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#D4AF37]/70 mb-4 line-clamp-2">
              {category.description || 'Kategoriya tavsifi'}
            </p>

            <Link href={`/test?category=${category.slug}`}>
              <button className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Testni boshlash
              </button>
            </Link>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
          <p className="text-[#D4AF37]/60">Kategoriya topilmadi</p>
        </div>
      )}
    </div>
  );
}

  // Statik gruplar
  const staticGroups = [
    {
      id: "programming",
      name: "Dasturlash",
      slugs: [
        "python",
        "javascript",
        "typescript",
        "java",
        "cpp",
        "golang",
        "rust",
      ],
    },
    {
      id: "frontend",
      name: "Frontend",
      slugs: ["react", "nextjs", "vuejs", "html-css", "tailwind"],
    },
    {
      id: "backend",
      name: "Backend",
      slugs: ["nodejs", "nestjs", "expressjs", "django"],
    },
    {
      id: "database",
      name: "Database",
      slugs: ["sql", "postgresql", "mongodb", "redis"],
    },
    { id: "devops", name: "DevOps", slugs: ["docker", "git", "linux"] },
    {
      id: "science",
      name: "Fanlar",
      slugs: ["matematika", "fizika", "ingliz-tili", "tarix"],
    },
    { id: "dtm", name: "DTM", slugs: [] }, // DTM guruhi
  ];

  // API dan kelgan kategoriyalar asosida gruplarni yangilash
  const groups = staticGroups.map((group) => {
    // API kategoriyalardan shu grupga tegishlilarni topish
    const apiSlugs = apiCategories
      .filter((cat: any) => cat.group === group.id)
      .map((cat: any) => cat.slug);

    return {
      ...group,
      slugs: [...new Set([...group.slugs, ...apiSlugs])],
    };
  });

  // API dan kelgan yangi (custom) gruplarni qo'shish
  const customGroupCategories = apiCategories.filter(
    (cat: any) =>
      cat.group &&
      cat.group !== "other" &&
      !staticGroups.some((g) => g.id === cat.group),
  );

  // Unique custom gruplar
  const customGroupIds = [
    ...new Set(customGroupCategories.map((cat: any) => cat.group)),
  ];

  customGroupIds.forEach((groupId: string) => {
    const groupCategories = customGroupCategories.filter(
      (cat: any) => cat.group === groupId,
    );
    if (groupCategories.length > 0) {
      const groupName = groupId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      groups.push({
        id: groupId,
        name: groupName,
        slugs: groupCategories.map((cat: any) => cat.slug),
      });
    }
  });

  // Bo'sh gruplarni olib tashlash
  const filteredGroups = groups.filter((g) => g.slugs.length > 0);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase());

    if (selectedGroup) {
      const group = filteredGroups.find((g) => g.id === selectedGroup);
      return matchesSearch && group?.slugs.includes(cat.slug);
    }

    return matchesSearch;
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Kategoriyalar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Test topshirmoqchi bo'lgan kategoriyangizni tanlang
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Kategoriya qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              !selectedGroup
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
            )}
          >
            Barchasi
          </button>
          {filteredGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                selectedGroup === group.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Hech narsa topilmadi
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const categoryIcon = (category as any).icon;
            const iconUrl = getCategoryIconUrl(category.slug, categoryIcon);
            // API dan yuklangan icon (/uploads/) yoki local icon
            const isUploadedIcon = categoryIcon?.startsWith("/uploads/");

            return (
              <Link key={category.id} href={`/test/${category.slug}`}>
                <Card hover className="h-full p-6 group">
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden ${
                        isUploadedIcon ? "w-16 h-16" : "w-14 h-14 p-2"
                      }`}
                    >
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={iconUrl}
                          alt={category.name}
                          className={
                            isUploadedIcon
                              ? "w-full h-full object-cover"
                              : "w-full h-full object-contain"
                          }
                        />
                      ) : (
                        <span className="text-3xl">📚</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      {(category as any)._count && (
                        <Badge variant="info">
                          {(category as any)._count.questions}+ savol
                        </Badge>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Mixed Test Card */}
      <div className="mt-8">
        <Link href="/test/mixed">
          <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🎲 Aralash test</h3>
                <p className="text-white/80">
                  Barcha kategoriyalardan random savollar bilan test topshiring
                </p>
              </div>
              <ArrowRight className="w-8 h-8" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
