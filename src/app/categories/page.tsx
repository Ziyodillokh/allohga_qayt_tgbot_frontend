"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks";
import { Card, Input, Badge } from "@/components/ui";
import { cn, getCategoryIconUrl } from "@/lib/utils";

// Statik 27 ta kategoriya
const allCategories = [
  {
    id: "1",
    name: "C++",
    slug: "cpp",
    description: "C++ dasturlash tili",
    color: "#00599C",
  },
  {
    id: "2",
    name: "Django",
    slug: "django",
    description: "Django web framework",
    color: "#092E20",
  },
  {
    id: "3",
    name: "Docker",
    slug: "docker",
    description: "Docker konteyner platformasi",
    color: "#2496ED",
  },
  {
    id: "4",
    name: "Ingliz tili",
    slug: "ingliz-tili",
    description: "Ingliz tili grammatikasi",
    color: "#DC143C",
  },
  {
    id: "5",
    name: "Express.js",
    slug: "expressjs",
    description: "Express.js backend framework",
    color: "#000000",
  },
  {
    id: "6",
    name: "Fizika",
    slug: "fizika",
    description: "Fizika fani asoslari",
    color: "#4169E1",
  },
  {
    id: "7",
    name: "Git",
    slug: "git",
    description: "Git version control",
    color: "#F05032",
  },
  {
    id: "8",
    name: "Go",
    slug: "golang",
    description: "Go dasturlash tili",
    color: "#00ADD8",
  },
  {
    id: "9",
    name: "Tarix",
    slug: "tarix",
    description: "Jahon va O'zbekiston tarixi",
    color: "#8B4513",
  },
  {
    id: "10",
    name: "HTML & CSS",
    slug: "html-css",
    description: "Web sahifa yaratish asoslari",
    color: "#E34F26",
  },
  {
    id: "11",
    name: "Java",
    slug: "java",
    description: "Java dasturlash tili",
    color: "#007396",
  },
  {
    id: "12",
    name: "JavaScript",
    slug: "javascript",
    description: "JavaScript dasturlash tili",
    color: "#F7DF1E",
  },
  {
    id: "13",
    name: "Linux",
    slug: "linux",
    description: "Linux operatsion tizimi",
    color: "#FCC624",
  },
  {
    id: "14",
    name: "Matematika",
    slug: "matematika",
    description: "Matematika fani",
    color: "#1E90FF",
  },
  {
    id: "15",
    name: "MongoDB",
    slug: "mongodb",
    description: "MongoDB NoSQL database",
    color: "#47A248",
  },
  {
    id: "16",
    name: "NestJS",
    slug: "nestjs",
    description: "NestJS backend framework",
    color: "#E0234E",
  },
  {
    id: "17",
    name: "Next.js",
    slug: "nextjs",
    description: "Next.js React framework",
    color: "#000000",
  },
  {
    id: "18",
    name: "Node.js",
    slug: "nodejs",
    description: "Node.js runtime",
    color: "#339933",
  },
  {
    id: "19",
    name: "PostgreSQL",
    slug: "postgresql",
    description: "PostgreSQL database",
    color: "#336791",
  },
  {
    id: "20",
    name: "Python",
    slug: "python",
    description: "Python dasturlash tili",
    color: "#3776AB",
  },
  {
    id: "21",
    name: "React",
    slug: "react",
    description: "React frontend kutubxonasi",
    color: "#61DAFB",
  },
  {
    id: "22",
    name: "Redis",
    slug: "redis",
    description: "Redis in-memory database",
    color: "#DC382D",
  },
  {
    id: "23",
    name: "Rust",
    slug: "rust",
    description: "Rust dasturlash tili",
    color: "#000000",
  },
  {
    id: "24",
    name: "SQL",
    slug: "sql",
    description: "SQL so'rovlar tili",
    color: "#4479A1",
  },
  {
    id: "25",
    name: "Tailwind CSS",
    slug: "tailwind",
    description: "Tailwind CSS framework",
    color: "#06B6D4",
  },
  {
    id: "26",
    name: "TypeScript",
    slug: "typescript",
    description: "TypeScript dasturlash tili",
    color: "#3178C6",
  },
  {
    id: "27",
    name: "Vue.js",
    slug: "vuejs",
    description: "Vue.js frontend framework",
    color: "#4FC08D",
  },
];

export default function CategoriesPage() {
  const { categories: apiCategories, loading, error } = useCategories();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // API dan kelgan yoki statik kategoriyalar
  const categories = apiCategories.length > 0 ? apiCategories : allCategories;

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
      !staticGroups.some((g) => g.id === cat.group)
  );

  // Unique custom gruplar
  const customGroupIds = [
    ...new Set(customGroupCategories.map((cat: any) => cat.group)),
  ];

  customGroupIds.forEach((groupId: string) => {
    const groupCategories = customGroupCategories.filter(
      (cat: any) => cat.group === groupId
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
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                        <span className="text-3xl">рџ“љ</span>
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
                <h3 className="text-xl font-bold mb-2">рџЋІ Aralash test</h3>
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
