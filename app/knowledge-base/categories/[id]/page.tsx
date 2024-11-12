"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Globe, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { Category } from "@/lib/api/categories";
import { Article } from "@/lib/api/articles";
import { ArticlesList } from "@/components/articles/articles-list";
import { CategoryEditModal } from "@/components/categories/category-edit-modal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryViewSkeleton } from "@/components/skeletons/category-view-skeleton";

const visibilityOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "private", label: "Private", icon: Lock },
] as const;

export default function CategoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select(`
            *,
            profiles:created_by (
              full_name
            )
          `)
          .eq("id", params.id)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select(`
            *,
            profiles:created_by (
              full_name
            ),
            categories:category_id (
              name
            )
          `)
          .eq("category_id", params.id)
          .order("created_at", { ascending: false });

        if (articlesError) throw articlesError;
        setArticles(articlesData);
      } catch (error) {
        toast.error("Failed to load category");
        router.push("/knowledge-base/categories");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return <CategoryViewSkeleton />;
  }

  const handleVisibilityChange = async (value: "public" | "private") => {
    if (!category) return;
    
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from("categories")
        .update({
          accessibility: value,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", category.id)
        .select()
        .single();

      if (error) throw error;
      setCategory(prev => prev ? { ...prev, accessibility: value } : null);
      toast.success("Category visibility updated");
    } catch (error) {
      toast.error("Failed to update visibility");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!category) {
    return null;
  }

  return (
    <div className="px-[20px] space-y-8">
      <div className="space-y-4">
        <Link
          href="/knowledge-base/categories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-2xl font-bold">{category.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={category.accessibility}
              onValueChange={handleVisibilityChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue>
                  <div className="flex items-center">
                    {category.accessibility === "public" ? (
                      <Globe className="mr-2 h-4 w-4" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {category.accessibility.charAt(0).toUpperCase() + category.accessibility.slice(1)}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Button>
          </div>
        </div>

        {category.description && (
          <p className="text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {articles.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <h3 className="text-lg font-semibold">No articles yet</h3>
            <p className="mt-2 mb-6 text-sm text-muted-foreground">
              This category doesn't have any articles yet.
            </p>
            <Link href={`/knowledge-base/articles/new?category=${category.id}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Article
              </Button>
            </Link>
          </Card>
        ) : (
          <ArticlesList articles={articles} />
        )}
      </div>

      <CategoryEditModal
        category={category}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={(updatedCategory) => {
          setCategory(updatedCategory);
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}