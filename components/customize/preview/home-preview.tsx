"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Input } from "@/components/ui/input";
import { Search, Pin, Star } from "lucide-react";
import Image from "next/image";
import { useCategories } from "@/hooks/use-categories";
import { useArticles } from "@/hooks/use-articles";
import { Card } from "@/components/ui/card";

interface HomePreviewProps {
  settings: KnowledgeBaseSettings;
  organizationName?: string;
  onCategoryClick: (categoryId: string) => void;
  onArticleClick: (articleId: string) => void;
}

export function HomePreview({ 
  settings, 
  organizationName,
  onCategoryClick,
  onArticleClick,
}: HomePreviewProps) {
  const { categories } = useCategories();
  const { articles } = useArticles();

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

  const publicCategories = categories.filter(
    cat => cat.accessibility === "public" && !cat.parent_id
  );

  const publishedArticles = articles.filter(
    article => article.status === "published" && article.visibility === "public"
  );

  const pinnedArticles = settings.content.pinnedArticles
    .map(id => publishedArticles.find(article => article.id === id))
    .filter(Boolean);

  const popularArticles = settings.content.popularArticles
    .map(id => publishedArticles.find(article => article.id === id))
    .filter(Boolean);

  return (
    <>
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
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

      {/* Banner */}
      <div 
        className="px-6 py-12 pb-20" 
        style={{ 
          backgroundColor: settings.theme.accentColor,
          color: getTextColor(settings.theme.accentColor)
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold">{settings.general.title}</h1>
          <p className="mb-8 opacity-90">
            {settings.general.description}
          </p>
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto pb-12 space-y-12 px-6 -mt-10">
        {/* Categories */}
        <div className={`grid gap-6 ${getCategoryGridCols(settings.content.categoriesPerRow)}`}>
          {publicCategories.map((category) => (
            <Card
              key={category.id}
              className="p-6 cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg"
              onClick={() => onCategoryClick(category.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <span className="text-4xl">{category.icon}</span>
                <h3 className="text-md font-medium">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {getCategoryArticleCount(category.id)} articles
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="grid gap-12 md:grid-cols-2">
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
                    <button
                      className="text-primary hover:underline text-left"
                      onClick={() => onArticleClick(article.id)}
                    >
                      {article.title}
                    </button>
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
                    <button
                      className="text-primary hover:underline text-left"
                      onClick={() => onArticleClick(article.id)}
                    >
                      {article.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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