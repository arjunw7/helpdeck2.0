"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Card } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useArticles } from "@/hooks/use-articles";
import Link from "next/link";

interface CategoriesProps {
  settings: KnowledgeBaseSettings;
  isPreview?: boolean;
}

export function Categories({ settings, isPreview }: CategoriesProps) {
  const { categories } = useCategories();
  const { articles } = useArticles();

  const publicCategories = categories.filter(
    cat => cat.accessibility === "public" && !cat.parent_id
  );

  const getCategoryArticleCount = (categoryId: string): number => {
    // Get direct articles
    const directArticles = articles.filter(
      article => article.category_id === categoryId && 
      article.status === "published" &&
      article.visibility === "public"
    ).length;

    // Get subcategories and their articles
    const subCategories = categories.filter(cat => cat.parent_id === categoryId);
    const subCategoryArticles = subCategories.reduce((acc, subCat) => 
      acc + getCategoryArticleCount(subCat.id), 0);

    return directArticles + subCategoryArticles;
  };

  const getCategoryGridCols = (perRow: number) => {
    switch (perRow) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-3";
    }
  };

  return (
    <div className="px-[5%] pb-12 space-y-12 -mt-20">
      <div className={`grid gap-6 ${getCategoryGridCols(settings.content.categoriesPerRow)}`}>
        {publicCategories.map((category) => (
          <Link
            key={category.id}
            href={isPreview ? "#" : `/kb/categories/${category.slug}`}
            onClick={(e) => isPreview && e.preventDefault()}
            className="h-full"
          >
            <Card className="h-full p-6 cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg">
              <div className="flex h-full flex-col items-center text-center">
                <span className="text-4xl mb-3">{category.icon}</span>
                <h3 className="text-xl font-medium mb-3">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-auto">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-3">
                  {getCategoryArticleCount(category.id)} articles
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}