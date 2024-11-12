"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/category-card";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "Development",
    description: "Articles about software development and programming",
    articleCount: 15,
  },
  {
    id: 2,
    name: "Design",
    description: "UI/UX design principles and best practices",
    articleCount: 8,
  },
];

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}