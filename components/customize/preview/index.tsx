"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { HomePreview } from "./home-preview";
import { CategoryPreview } from "./category-preview";
import { ArticlePreview } from "./article-preview";

interface KnowledgeBasePreviewProps {
  settings: KnowledgeBaseSettings;
  organizationName?: string;
  currentView: "home" | "category" | "article";
  onViewChange: (view: "home" | "category" | "article") => void;
  selectedCategoryId?: string;
  selectedArticleId?: string;
  onCategoryClick: (categoryId: string) => void;
  onArticleClick: (articleId: string) => void;
}

export function KnowledgeBasePreview({ 
  settings, 
  organizationName,
  currentView,
  onViewChange,
  selectedCategoryId,
  selectedArticleId,
  onCategoryClick,
  onArticleClick,
}: KnowledgeBasePreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      {currentView === "home" && (
        <HomePreview 
          settings={settings} 
          organizationName={organizationName}
          onCategoryClick={onCategoryClick}
          onArticleClick={onArticleClick}
        />
      )}
      {currentView === "category" && (
        <CategoryPreview 
          settings={settings}
          organizationName={organizationName}
          categoryId={selectedCategoryId}
          onArticleClick={onArticleClick}
          onCategoryClick={onCategoryClick}
          onViewChange={onViewChange}
        />
      )}
      {currentView === "article" && (
        <ArticlePreview 
          settings={settings}
          organizationName={organizationName}
          articleId={selectedArticleId}
          onCategoryClick={onCategoryClick}
          onViewChange={onViewChange}
        />
      )}
    </div>
  );
}