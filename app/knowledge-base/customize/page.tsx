"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/customize/general-settings";
import { ThemeSettings } from "@/components/customize/theme-settings";
import { NavigationSettings } from "@/components/customize/navigation-settings";
import { FeaturedContent } from "@/components/customize/featured-content";
import { Eye } from "lucide-react";
import { useCustomizeStore } from "@/stores/customize";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CustomizePage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const { settings } = useCustomizeStore();
  const { organization } = useAuth();

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) throw new Error("No organization found");

      const { error } = await supabase
        .from("customize_settings")
        .upsert({
          org_id: profile.org_id,
          settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "org_id",
        });

      if (error) throw error;
      
      toast.success("Settings published successfully");
    } catch (error) {
      console.error("Error publishing settings:", error);
      toast.error("Failed to publish settings");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="px-[20px] space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Customize the appearance and content of your public knowledge base
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push("/knowledge-base/customize/preview")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="theme" className="flex-1">Theme</TabsTrigger>
          <TabsTrigger value="navigation" className="flex-1">Navigation</TabsTrigger>
          <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationSettings />
        </TabsContent>

        <TabsContent value="content">
          <FeaturedContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}