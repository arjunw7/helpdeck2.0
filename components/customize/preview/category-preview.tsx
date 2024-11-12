"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Input } from "@/components/ui/input";
import { Search, FileText, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCategories } from "@/hooks/use-categories";
import { useArticles } from "@/hooks/use-articles";
import { Card } from "@/components/ui/card";

interface CategoryPreviewProps {
  settings: KnowledgeBaseSettings;
  organizationName?: string;
  categoryId?: string;
  onArticleClick: (articleId: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onViewChange: (view: "home" | "category" | "article") => void;
}

export function CategoryPreview({ 
  settings, 
  organizationName,
  categoryId,
  onArticleClick,
  onCategoryClick,
  onViewChange,
}: CategoryPreviewProps) {
  const { categories } = useCategories();
  const { articles } = useArticles();

  // Get category and its articles
  const category = categoryId ? categories.find(c => c.id === categoryId) : categories[0];
  const categoryArticles = articles.filter(
    article => article.category_id === category?.id && 
    article.status === "published" &&
    article.visibility === "public"
  );

  const getTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return 'black';
    const luminance = getLuminance(rgb);
    return luminance < 0.5 ? 'white' : 'black';
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = ({ r, g, b }: { r: number, g: number, b: number }) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.general.logo ? (
              <Image
                src={settings.general.logo}
                alt="Logo"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-lg font-bold">
                {organizationName || settings.general.title}
              </span>
            )}
          </div>
          <nav className="flex items-center gap-4">
            {settings.navigation.menuItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="text-sm hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Category Banner */}
      <div 
        className="px-6 py-12"
        style={{ 
          backgroundColor: settings.theme.accentColor,
          color: getTextColor(settings.theme.accentColor)
        }}
      >
        <div className="container mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-8 opacity-90">
            <button 
              onClick={() => onViewChange("home")}
              className="hover:opacity-80 cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="h-4 w-4 opacity-50" />
            <span>{category?.name || "Sample Category"}</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl">{category?.icon || "📚"}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">{category?.name || "Sample Category"}</h1>
              {category?.description && (
                <p className="opacity-90">{category.description}</p>
              )}
            </div>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 opacity-50" />
            <Input
              placeholder="Search articles..."
              className="pl-10 bg-white/10 border-white/20 placeholder:text-inherit placeholder:opacity-60"
              style={{ color: getTextColor(settings.theme.accentColor) }}
            />
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="container mx-auto py-12 px-6">
        {categoryArticles.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Articles Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This category doesn't have any articles yet. Check back later for updates.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {categoryArticles.map((article) => (
              <Card 
                key={article.id}
                className="p-6 hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => onArticleClick(article.id)}
              >
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                {article.subtitle && (
                  <p className="text-muted-foreground">{article.subtitle}</p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Contact Support */}
        {settings.content.showContactSupport && settings.content.contactEmail && (
          <div className="mt-8 rounded-lg bg-muted p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold">Need More Help?</h2>
            <p className="text-sm text-muted-foreground">
              Contact our support team at{" "}
              <a
                href={`mailto:${settings.content.contactEmail}`}
                className="text-primary hover:underline"
              >
                {settings.content.contactEmail}
              </a>
            </p>
          </div>
        )}
      </div>
    </>
  );
}