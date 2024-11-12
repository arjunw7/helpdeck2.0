"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye } from "lucide-react";
import Link from "next/link";
import { Article } from "@/lib/api/articles";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/10 text-green-500";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500";
      case "archived":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-blue-500/10 text-blue-500";
    }
  };

  return (
    <Link href={`/knowledge-base/articles/${article.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            <Badge className={getStatusColor(article.status)} variant="secondary">
              {article.status}
            </Badge>
          </div>
          {article.subtitle && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {article.subtitle}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Badge variant="outline">{article.categories.name}</Badge>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.profiles.full_name}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}