"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
    articleCount: number;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {category.description}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            {category.articleCount} {category.articleCount === 1 ? "article" : "articles"}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}