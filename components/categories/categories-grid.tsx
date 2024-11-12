import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import { Category } from "@/lib/api/categories";
import Link from "next/link";

interface CategoriesGridProps {
  categories: Category[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/knowledge-base/categories/${category.id}`}
        >
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="mr-2 h-5 w-5 text-primary" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Created by {category.profiles.full_name}</span>
                <span>
                  {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}