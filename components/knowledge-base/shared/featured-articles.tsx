"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Card } from "@/components/ui/card";
import { Pin, Star } from "lucide-react";
import { useArticles } from "@/hooks/use-articles";
import Link from "next/link";

interface FeaturedArticlesProps {
  settings: KnowledgeBaseSettings;
  isPreview?: boolean;
}

export function FeaturedArticles({ settings, isPreview }: FeaturedArticlesProps) {
  const { articles } = useArticles();

  const publishedArticles = articles.filter(
    article => article.status === "published" && article.visibility === "public"
  );

  const pinnedArticles = settings.content.pinnedArticles
    .map(id => publishedArticles.find(article => article.id === id))
    .filter(Boolean);

  const popularArticles = settings.content.popularArticles
    .map(id => publishedArticles.find(article => article.id === id))
    .filter(Boolean);

  if (pinnedArticles.length === 0 && popularArticles.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-12 md:grid-cols-2 mx-[5%] pb-10">
      {/* Pinned Articles */}
      {pinnedArticles.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Pin className="h-5 w-5" />
            Pinned Articles
          </h2>
          <ul className="space-y-2">
            {pinnedArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={isPreview ? "#" : `/kb/articles/${article.slug}`}
                  onClick={(e) => isPreview && e.preventDefault()}
                  className="text-primary hover:underline"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Star className="h-5 w-5" />
            Popular Articles
          </h2>
          <ul className="space-y-2">
            {popularArticles.map((article) => (
              <li key={article.id}>
                <Link
                  href={isPreview ? "#" : `/kb/articles/${article.slug}`}
                  onClick={(e) => isPreview && e.preventDefault()}
                  className="text-primary hover:underline"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}