"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DomainSettings } from "@/components/domain-seo/domain-settings";
import { SeoSettings } from "@/components/domain-seo/seo-settings";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DomainSeoPage() {
  const { user } = useAuth();
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    async function loadPublishingStatus() {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();

        if (!profile?.org_id) return;

        const { data: org, error } = await supabase
          .from("organizations")
          .select("is_published")
          .eq("id", profile.org_id)
          .single();

        if (error) throw error;

        setIsPublished(org?.is_published || false);
      } catch (error) {
        console.error("Error loading publishing status:", error);
        toast.error("Failed to load publishing status");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublishingStatus();
  }, [user]);

  const handlePublishingUpdate = async () => {
    if (!user) return;
    setIsUpdating(true);

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
          is_published: !isPublished,
          published_at: !isPublished ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.org_id);

      if (error) throw error;

      setIsPublished(!isPublished);
      toast.success(isPublished ? "Knowledge base unpublished" : "Knowledge base published");
    } catch (error) {
      console.error("Error updating publishing status:", error);
      toast.error("Failed to update publishing status");
    } finally {
      setIsUpdating(false);
      setShowDialog(false);
    }
  };

  return (
    <div className="px-[20px] space-y-8">
      <Tabs defaultValue="domain" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="domain" className="flex-1">Domain</TabsTrigger>
          <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="domain">
          <DomainSettings />
        </TabsContent>

        <TabsContent value="seo">
          <SeoSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}