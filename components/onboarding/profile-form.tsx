"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface ProfileFormProps {
  organizationData: {
    name: string;
    logo: string;
  };
}

export function ProfileForm({ organizationData }: ProfileFormProps) {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    avatarUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setIsLoading(true);
      const { publicUrl } = await uploadImage(file, 'helpdeck', 'avatars');
      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setPreviewUrl(URL.createObjectURL(file));
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("No authenticated user");

      // Update user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Refresh user data to update the UI
      await refreshUserData();

      toast.success("Profile updated successfully!");
      router.push("/knowledge-base/analytics");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add your personal information to complete the setup
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullName: e.target.value }))
            }
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Profile Picture</Label>
          <div className="flex flex-col gap-4">
            {previewUrl && (
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl} alt="Profile preview" />
                <AvatarFallback>
                  {formData.fullName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            )}
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Square image recommended, max 2MB
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Completing Setup..." : "Complete Setup"}
        </Button>
      </form>
    </div>
  );
}