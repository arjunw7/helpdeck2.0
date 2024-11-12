"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { KnowledgeBaseLayout } from "@/components/knowledge-base/shared/layout";
import { Header } from "@/components/knowledge-base/shared/header";
import { ContactSupport } from "@/components/knowledge-base/shared/contact-support";
import { KnowledgeBaseSettings } from "@/stores/customize";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  slug: string;
  parent_id: string | null;
}

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  content: any;
  slug: string;
  category_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [organization, setOrganization] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get settings from response headers
        const response = await fetch("/api/kb/settings");
        const data = await response.json();
        
        if (data.settings) {
          setSettings(data.settings);
        }

        if (data.organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', data.organizationId)
            .single();

          setOrganization(org);
        }

        // Get current category
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', params.slug)
          .single();

        if (categoryData) {
          setCategory(categoryData);

          // Get subcategories
          const { data: subcatsData } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', categoryData.id)
            .eq('accessibility', 'public');

          if (subcatsData) {
            setSubcategories(subcatsData);
          }

          // Get articles for this category and its subcategories
          const categoryIds = [categoryData.id, ...(subcatsData?.map(sc => sc.id) || [])];
          const { data: articlesData } = await supabase
            .from('articles')
            .select(`
              *,
              profiles:created_by (
                full_name
              )
            `)
            .in('category_id', categoryIds)
            .eq('status', 'published')
            .eq('visibility', 'public');

          if (articlesData) {
            setArticles(articlesData);
          }
        }
      } catch (error) {
        console.error('Error loading category data:', error);
        toast.error('Failed to load category');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.slug]);

  if (!settings || !category) {
    return null;
  }

  const mainArticles = articles.filter(article => article.category_id === category.id);

  return (
    <KnowledgeBaseLayout settings={settings}>
      <Header settings={settings} organizationName={organization?.name} />
      
      {/* Category Banner */}
      <div 
        className="px-[5%] py-12"
        style={{ backgroundColor: settings.theme.accentColor }}
      >
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-8 text-white/90">
            <Link href="/kb" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <span>{category.name}</span>
          </div>

          <div className="flex items-center gap-4 text-white">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-white/90">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="px-[5%] pt-8">
        {/* Main category articles */}
        {mainArticles.length > 0 && (
          <div className="mb-12">
            <div className="space-y-4">
              {mainArticles.map((article) => (
                <Link key={article.id} href={`/kb/articles/${article.slug}`}>
                  <Card className="p-6 hover:bg-muted/50 transition-colors mb-4">
                    <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                    {article.subtitle && (
                      <p className="text-muted-foreground">{article.subtitle}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories and their articles */}
        {subcategories.map((subcategory) => {
          const subcategoryArticles = articles.filter(
            article => article.category_id === subcategory.id
          );

          if (subcategoryArticles.length === 0) return null;

          return (
            <div key={subcategory.id} className="mb-12">
              <Link href={`/kb/categories/${subcategory.slug}`}>
                <div className="flex items-center gap-2 mb-4 group">
                  <span className="text-2xl">{subcategory.icon}</span>
                  <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {subcategory.name}
                  </h2>
                </div>
              </Link>
              <div className="space-y-4">
                {subcategoryArticles.map((article) => (
                  <Link key={article.id} href={`/kb/articles/${article.slug}`}>
                    <Card className="p-6 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                      {article.subtitle && (
                        <p className="text-muted-foreground">{article.subtitle}</p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {settings.content.showContactSupport && settings.content.contactEmail && (
          <ContactSupport settings={settings} />
        )}
    </KnowledgeBaseLayout>
  );
}