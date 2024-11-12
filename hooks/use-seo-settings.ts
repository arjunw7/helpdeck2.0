"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
  googleAnalyticsId: string;
}

export function useSeoSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SeoSettings>({
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    favicon: "",
    googleAnalyticsId: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) {
        setIsLoading(false);
        return;
      }

      const { data: org, error } = await supabase
        .from("organizations")
        .select("seo_settings")
        .eq("id", profile.org_id)
        .single();

      if (error) throw error;

      if (org?.seo_settings) {
        setSettings(org.seo_settings);
      }
    } catch (error) {
      console.error("Error loading SEO settings:", error);
      toast.error("Failed to load SEO settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
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
          seo_settings: settings,
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

  const updateSettings = (newSettings: Partial<SeoSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    saveSettings,
  };
}