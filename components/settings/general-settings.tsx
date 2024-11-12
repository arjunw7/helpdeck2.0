"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/customize/image-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SettingsGeneralSkeleton } from "@/components/skeletons/settings-general-skeleton";

export function GeneralSettings() {
  const { user, organization: initialOrg } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [organization, setOrganization] = useState({
    name: "",
    logo: "",
  });
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
    role: "",
  });

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            avatar_url: profileData.avatar_url || "",
            role: profileData.role || "member",
          });
        }

        if (initialOrg) {
          setOrganization({
            name: initialOrg.name,
            logo: initialOrg.logo || "",
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [user, initialOrg]);

  const handleOrganizationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || profile?.role === "member") return;

    setIsSaving(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user?.id)
        .single();

      if (!profile?.org_id) throw new Error("Organization not found");

      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          name: organization.name,
          logo: organization.logo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.org_id);

      if (updateError) throw updateError;
      
      toast.success("Organization settings updated successfully");
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SettingsGeneralSkeleton />;
  }

  return (
    <div className="grid gap-6">
      {/* Organization Settings */}
      {(profile?.role === "owner" || profile?.role === "admin") && (
        <Card className="p-6">
          <form onSubmit={handleOrganizationUpdate}>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Organization Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your organization's basic information
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={organization.name}
                    onChange={(e) =>
                      setOrganization((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Organization Logo</Label>
                  <ImageUpload
                    value={organization.logo}
                    onChange={(url) =>
                      setOrganization((prev) => ({
                        ...prev,
                        logo: url,
                      }))
                    }
                    accept="image/*"
                    maxSize={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: PNG or JPG, max 2MB
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Organization"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Profile Settings */}
      <Card className="p-6">
        <form onSubmit={handleProfileUpdate}>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal information
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <ImageUpload
                  value={profile.avatar_url}
                  onChange={(url) =>
                    setProfile((prev) => ({
                      ...prev,
                      avatar_url: url,
                    }))
                  }
                  accept="image/*"
                  maxSize={2}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: Square image, max 2MB
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}