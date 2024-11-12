"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Eye, Edit } from "lucide-react";
import { Article } from "@/lib/api/articles";
import { useArticles } from "@/hooks/use-articles";
import { toast } from "sonner";

export default function ArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getArticle } = useArticles();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await getArticle(params.id);
        setArticle(data);
      } catch (error) {
        toast.error("Failed to load article");
        router.push("/knowledge-base/articles");
      }
    }
    fetchArticle();
  }, [params.id]);

  if (!article) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the article.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{article.title}</h1>
            <Button
              variant="outline"
              onClick={() => router.push(`/knowledge-base/articles/${article.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Article
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Badge variant="secondary">{article.categories.name}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {article.profiles.full_name}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {article.views} views
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(article.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {article.content}
        </div>
      </Card>
    </div>
  );
}