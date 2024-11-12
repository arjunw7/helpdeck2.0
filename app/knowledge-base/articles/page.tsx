"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useArticles } from "@/hooks/use-articles";
import { ArticlesList } from "@/components/articles/articles-list";
import { ArticleListSkeleton } from "@/components/skeletons/article-list-skeleton";
import { EmptyState } from "@/components/articles/empty-state";
import { useRouter } from "next/navigation";

export default function ArticlesPage() {
  const router = useRouter();
  const { articles, isLoading } = useArticles();
  
  // Filter out deleted articles
  const activeArticles = articles.filter(article => article.status !== "archived");

  if (isLoading) {
    return <ArticleListSkeleton />;
  }

  const handleCreateClick = () => {
    router.push("/knowledge-base/articles/new");
  };

  return (
    <div className="px-[20px] space-y-8">
      {activeArticles.length === 0 ? (
        <EmptyState onCreateClick={handleCreateClick} />
      ) : (
          <ArticlesList articles={activeArticles} />
      )}
    </div>
  );
}