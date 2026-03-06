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
