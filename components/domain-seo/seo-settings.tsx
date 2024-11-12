"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/customize/image-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
  googleAnalyticsId: string;
}

const defaultSettings: SeoSettings = {
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  favicon: "",
  googleAnalyticsId: "",
};

export function SeoSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<SeoSettings>(defaultSettings);

  useEffect(() => {
    async function loadSeoSettings() {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (!profile?.org_id) {
          throw new Error("Organization not found");
        }

        const { data: org, error } = await supabase
          .from("organizations")
          .select("seo_settings")
          .eq("id", profile.org_id)
          .single();

        if (error) throw error;

        if (org?.seo_settings) {
          setLocalSettings({
            metaTitle: org.seo_settings.metaTitle || "",
            metaDescription: org.seo_settings.metaDescription || "",
            ogImage: org.seo_settings.ogImage || "",
            favicon: org.seo_settings.favicon || "",
            googleAnalyticsId: org.seo_settings.googleAnalyticsId || "",
          });
        }
      } catch (error) {
        console.error("Error loading SEO settings:", error);
        toast.error("Failed to load SEO settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadSeoSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) {
        throw new Error("Organization not found");
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          seo_settings: localSettings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.org_id);

      if (error) throw error;

      toast.success("SEO settings saved successfully");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={localSettings.metaTitle}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
            placeholder="Knowledge Base - Your Company Name"
          />
          <p className="text-xs text-muted-foreground">
            Recommended length: 50-60 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={localSettings.metaDescription}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
            placeholder="A brief description of your knowledge base"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Recommended length: 150-160 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label>Social Share Image</Label>
          <ImageUpload
            value={localSettings.ogImage}
            onChange={(url) => setLocalSettings(prev => ({ ...prev, ogImage: url }))}
            accept="image/*"
            maxSize={2}
          />
          <p className="text-xs text-muted-foreground">
            Recommended size: 1200x630px (PNG or JPG)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Favicon</Label>
          <ImageUpload
            value={localSettings.favicon}
            onChange={(url) => setLocalSettings(prev => ({ ...prev, favicon: url }))}
            accept="image/x-icon,image/png"
            maxSize={1}
          />
          <p className="text-xs text-muted-foreground">
            Recommended size: 32x32px (ICO or PNG)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
          <Input
            id="googleAnalyticsId"
            value={localSettings.googleAnalyticsId}
            onChange={(e) => setLocalSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground">
            Enter your Google Analytics 4 Measurement ID
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}