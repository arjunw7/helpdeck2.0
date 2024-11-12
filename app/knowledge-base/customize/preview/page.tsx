"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomizeStore } from "@/stores/customize";
import { useAuth } from "@/hooks/use-auth";
import { KnowledgeBaseLayout } from "@/components/knowledge-base/shared/layout";
import { Header } from "@/components/knowledge-base/shared/header";
import { Hero } from "@/components/knowledge-base/shared/hero";
import { Categories } from "@/components/knowledge-base/shared/categories";
import { FeaturedArticles } from "@/components/knowledge-base/shared/featured-articles";
import { ContactSupport } from "@/components/knowledge-base/shared/contact-support";

export default function PreviewPage() {
  const router = useRouter();
  const { settings } = useCustomizeStore();
  const { organization } = useAuth();

  return (
    <div className="px-[20px] space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/knowledge-base/customize"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div className="w-full rounded-lg border overflow-hidden">
        <KnowledgeBaseLayout settings={settings}>
          <Header 
            settings={settings} 
            organizationName={organization?.name} 
            isPreview={true}
          />
          <Hero settings={settings} />
          <Categories settings={settings} isPreview={true} />
          <FeaturedArticles settings={settings} isPreview={true} />
          {settings.content.showContactSupport && settings.content.contactEmail && (
            <ContactSupport settings={settings} isPreview={true} />
          )}
        </KnowledgeBaseLayout>
      </div>
    </div>
  );
}