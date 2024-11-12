"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FolderOpen } from "lucide-react";
import { CategoryModal } from "@/components/categories/category-modal";
import { EmptyState } from "@/components/categories/empty-state";
import { CategoriesTable } from "@/components/categories/categories-table";
import { useCategories } from "@/hooks/use-categories";
import { useCategoriesStore } from "@/stores/categories";
import { CategoryListSkeleton } from "@/components/skeletons/category-list-skeleton";

export default function CategoriesPage() {
  const { categories, isLoading } = useCategories();
  const {
    searchQuery,
    setSearchQuery,
    showCategoryModal,
    setShowCategoryModal,
    filteredCategories,
  } = useCategoriesStore();

  const filteredResults = filteredCategories(categories);

  if (isLoading) {
    return <CategoryListSkeleton />;
  }

  return (
    <div className="px-[20px] space-y-8">
      {/* Search */}
      {(filteredResults.length !== 0 || searchQuery) && <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>}

      {/* Categories */}
      <div>
        {filteredResults.length === 0 ? (
          searchQuery ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold">No categories found</h3>
                  <p className="text-sm text-muted-foreground">
                    No categories match your search
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState onCreateClick={() => setShowCategoryModal(true)} />
          )
        ) : (
          <CategoriesTable categories={filteredResults} />
        )}
      </div>

      <CategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        categories={categories}
      />
    </div>
  );
}