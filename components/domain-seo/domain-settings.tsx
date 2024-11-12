"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, InfoIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishSuccessDialog } from "./publish-success-dialog";
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

export function DomainSettings() {
  const { user } = useAuth();
  const [customDomain, setCustomDomain] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSavingSlug, setIsSavingSlug] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"success" | "error" | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugSaved, setSlugSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    async function loadOrganizationSettings() {
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
          .select("slug, custom_domain, is_published")
          .eq("id", profile.org_id)
          .single();

        if (error) throw error;

        if (org) {
          setOrgSlug(org.slug || "");
          setOriginalSlug(org.slug || "");
          setCustomDomain(org.custom_domain || "");
          setIsPublished(org.is_published || false);
          setSlugAvailable(null);
          setSlugSaved(true);
        }
      } catch (error) {
        console.error("Error loading organization settings:", error);
        toast.error("Failed to load organization settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganizationSettings();
  }, [user]);

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) {
      setSlugAvailable(null);
      setSlugSaved(false);
      return;
    }

    if (slug === originalSlug) {
      setSlugAvailable(true);
      setSlugSaved(true);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const { data, count, error } = await supabase
        .from("organizations")
        .select("id", { count: 'exact' })
        .eq("slug", slug);

      if (error) throw error;
      
      setSlugAvailable(count === 0);
      setSlugSaved(false);
    } catch (error) {
      console.error("Error checking slug availability:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setOrgSlug(value);
    setSlugSaved(false);
    checkSlugAvailability(value);
  };

  const handleVerifyDomain = async () => {
    if (!customDomain) {
      toast.error("Please enter a custom domain");
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(customDomain);

      if (!isValid) {
        throw new Error("Invalid domain format");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.org_id) {
        throw new Error("Organization not found");
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          custom_domain: customDomain,
          domain_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.org_id);

      if (error) throw error;

      setVerificationStatus("success");
      toast.success("Domain verified successfully");
    } catch (error) {
      setVerificationStatus("error");
      toast.error(error instanceof Error ? error.message : "Failed to verify domain");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveSlug = async () => {
    if (!orgSlug || !slugAvailable || orgSlug === originalSlug) return;

    setIsSavingSlug(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.org_id) {
        throw new Error("Organization not found");
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          slug: orgSlug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.org_id);

      if (error) throw error;
      
      setSlugSaved(true);
      setOriginalSlug(orgSlug);
      toast.success("Organization domain updated successfully");
    } catch (error) {
      toast.error("Failed to update organization domain");
      setSlugSaved(false);
    } finally {
      setIsSavingSlug(false);
    }
  };

  const handlePublish = async () => {
    if (!orgSlug) {
      toast.error("Please set an organization domain first");
      setShowPublishDialog(false);
      return;
    }

    setIsPublishing(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user?.id)
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
      
      if (!isPublished) {
        setShowSuccessDialog(true);
      } else {
        toast.success("Knowledge base unpublished");
      }
    } catch (error) {
      toast.error("Failed to update publishing status");
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <Alert className="bg-primary/5 border-primary/10">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-primary">
              Configure your help center domains to provide a professional and branded experience for your users.
            </AlertDescription>
          </Alert>

          {/* Organization Domain Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Custom Domain Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>

          {/* DNS Configuration Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="rounded-md bg-muted p-4">
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="space-y-6 pt-6">

          {/* Publishing Status */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="font-semibold">Publishing Status</h3>
              <p className="text-sm text-muted-foreground">
                {isPublished 
                  ? "Your knowledge base is live and accessible to users" 
                  : "Make your knowledge base accessible to users"}
              </p>
            </div>
            <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
              <AlertDialogTrigger asChild>
                <Button variant={isPublished ? "destructive" : "default"}>
                  {isPublished ? "Unpublish Knowledge Base" : "Publish Knowledge Base"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isPublished ? "Unpublish Knowledge Base?" : "Publish Knowledge Base?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isPublished
                      ? "This will make your knowledge base inaccessible to users. You can publish it again at any time."
                      : "This will make your knowledge base accessible to users. Make sure you have configured your domains and SEO settings."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePublish}
                    className={isPublished ? "bg-red-500 hover:bg-red-600" : ""}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPublished ? "Unpublishing..." : "Publishing..."}
                      </>
                    ) : (
                      isPublished ? "Yes, unpublish" : "Yes, publish"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          {/* <Alert className="bg-primary/5 border-primary/10">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm text-primary">
              Configure your help center domains to provide a professional and branded experience for your users.
            </AlertDescription>
          </Alert> */}

          {/* Organization Domain */}
          <div className="space-y-2">
            <Label htmlFor="orgSlug">Organization Domain</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="orgSlug"
                  value={orgSlug}
                  onChange={handleSlugChange}
                  placeholder="your-company"
                  className="pr-32"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  .helpdeck.app
                </span>
              </div>
              <Button 
                onClick={handleSaveSlug}
                disabled={!orgSlug || !slugAvailable || isCheckingSlug || isSavingSlug || (orgSlug === originalSlug)}
              >
                {isSavingSlug ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
            <div className="h-6">
              {isCheckingSlug ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking availability...
                </div>
              ) : orgSlug && slugAvailable !== null && (
                <div className="flex items-center gap-2 text-sm">
                  {slugSaved ? (
                    <p className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Domain saved successfully!
                    </p>
                  ) : (
                    <p className={slugAvailable ? 'text-green-500' : 'text-red-500'}>
                      {slugAvailable ? 'Domain available!' : 'Domain already taken'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-2">
            <Label htmlFor="customDomain">Custom Domain</Label>
            <div className="flex gap-2">
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="docs.example.com"
                className="flex-1"
              />
              <Button onClick={handleVerifyDomain} disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Domain"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your custom domain without http:// or https://
            </p>
          </div>

          {verificationStatus && (
            <Alert variant={verificationStatus === "success" ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {verificationStatus === "success" ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Domain verified successfully</AlertDescription>
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>Failed to verify domain</AlertDescription>
                    <Badge variant="secondary" className="ml-auto">Failed</Badge>
                  </>
                )}
              </div>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">DNS Configuration</h3>
            <div className="rounded-md bg-muted p-4">
              <p className="mb-4 text-sm">Add these records to your DNS provider:</p>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <p>Type: CNAME</p>
                  <p>Name: docs</p>
                  <p>Value: kb.helpdeck.app</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PublishSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        orgSlug={orgSlug}
      />
    </>
  );
}