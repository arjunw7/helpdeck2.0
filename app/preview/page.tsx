"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCustomizeStore } from "@/stores/customize";
import { Category } from "@/lib/api/categories";
import { Article } from "@/lib/api/articles";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

const getTextColor = (bgColor: string): string => {
        // Convert hex color to RGB
        function hexToRgb(hex: string) {
            const bigint = parseInt(hex.replace('#', ''), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return { r, g, b };
        }

        // Calculate luminance of the color
        function getLuminance({ r, g, b }: { r: number; g: number; b: number }) {
            const a = [r, g, b].map((v) => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        }

        // Convert background color to RGB and calculate its luminance
        const rgb = hexToRgb(bgColor);
        const luminance = getLuminance(rgb);

        // Set text color based on luminance threshold
        return luminance < 0.5 ? 'white' : 'black';
    }

export default function PreviewPage() {
  const { user } = useAuth();
  const settings = useCustomizeStore((state) => state.settings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch organization
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (profile?.org_id) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", profile.org_id)
            .single();
          
          setOrganization(orgData);

          // Fetch categories
          const { data: categoriesData } = await supabase
            .from("categories")
            .select("*")
            .eq("org_id", profile.org_id)
            .eq("accessibility", "public");

          if (categoriesData) {
            setCategories(categoriesData);
          }

          // Fetch articles
          const { data: articlesData } = await supabase
            .from("articles")
            .select(`
              *,
              profiles:created_by (full_name),
              categories:category_id (name)
            `)
            .eq("org_id", profile.org_id)
            .eq("visibility", "public")
            .eq("status", "published");

          if (articlesData) {
            setArticles(articlesData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background" style={{
      backgroundColor: settings.theme.backgroundColor,
      color: getTextColor(settings.theme.backgroundColor),
      fontFamily: settings.theme.fontFamily || undefined,
    }}>
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
                {organization?.name || settings.general.title}
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
      <div className="bg-muted px-6 py-24" style={{ backgroundColor: settings.theme.accentColor }}>
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold" style={{ color: getTextColor(settings.theme.accentColor)}} >{settings.general.title}</h1>
          <p className="mb-8 text-xl text-muted-foreground" style={{ color: getTextColor(settings.theme.accentColor)}}>
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
      <div className="container mx-auto py-12">
        {/* Categories */}
        <div className="mb-12">
          <div className={`grid gap-6 ${getCategoryGridCols(settings.content.categoriesPerRow)}`}>
            {categories.map((category) => (
              <Card key={category.id} className="p-6">
                <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        {articles.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Popular Articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Card key={article.id} className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">{article.title}</h3>
                  {article.subtitle && (
                    <p className="text-sm text-muted-foreground">{article.subtitle}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support */}
        {settings.content.showContactSupport && settings.content.contactEmail && (
          <div className="mt-16 rounded-lg bg-muted p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Need More Help?</h2>
            <p className="text-muted-foreground">
              Contact our support team at{" "}
              <Link
                href={`mailto:${settings.content.contactEmail}`}
                className="text-primary hover:underline"
              >
                {settings.content.contactEmail}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}