"use client";

import { useEffect, useState } from "react";
import { KnowledgeBaseSettings } from "@/stores/customize";
import { KnowledgeBaseLayout } from "@/components/knowledge-base/shared/layout";
import { Header } from "@/components/knowledge-base/shared/header";
import { Hero } from "@/components/knowledge-base/shared/hero";
import { Categories } from "@/components/knowledge-base/shared/categories";
import { FeaturedArticles } from "@/components/knowledge-base/shared/featured-articles";
import { ContactSupport } from "@/components/knowledge-base/shared/contact-support";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Organization {
  id: string;
  name: string;
  logo: string;
}

export default function PublicKnowledgeBasePage() {
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
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
          const { data: org, error } = await supabase
            .from('organizations')
            .select('id, name, logo')
            .eq('id', data.organizationId)
            .single();

          if (error) throw error;
          setOrganization(org);
        }
      } catch (error) {
        console.error('Error loading knowledge base data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b px-6 py-4">
          <div className="container mx-auto">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="px-6 py-24 bg-primary/5">
          <div className="container mx-auto text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <div className="max-w-2xl mx-auto mt-8">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        <div className="container mx-auto py-12 space-y-12">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings || !organization) {
    return null;
  }

  return (
    <KnowledgeBaseLayout settings={settings}>
      <Header settings={settings} organizationName={organization.name} />
      <Hero settings={settings} />
      <main className="py-12 space-y-4">
        <Categories settings={settings} />
        <FeaturedArticles settings={settings} />
        {settings.content.showContactSupport && settings.content.contactEmail && (
          <ContactSupport settings={settings} />
        )}
      </main>
    </KnowledgeBaseLayout>
  );
}