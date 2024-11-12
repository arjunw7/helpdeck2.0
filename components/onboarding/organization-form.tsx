"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

interface OrganizationFormProps {
  onSubmit: (data: {
    name: string;
    logo: string;
  }) => void;
}

export function OrganizationForm({ onSubmit }: OrganizationFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      const { publicUrl } = await uploadImage(file, 'helpdeck', 'organizations');
      setFormData(prev => ({ ...prev, logo: publicUrl }));
      setPreviewUrl(URL.createObjectURL(file));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
      console.error('Error uploading logo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !user?.email) {
        throw new Error("Please fill in all required fields");
      }

      const response = await fetch('/api/organizations/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create organization');
      }

      const data = await response.json();
      onSubmit(data);
      toast.success("Organization created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Setup Your Organization</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your organization
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter organization name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Organization Logo</Label>
          <div className="flex flex-col gap-4">
            {previewUrl && (
              <div className="relative h-32 w-32 overflow-hidden rounded-lg border">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Recommended: PNG or JPG, max 5MB
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Continue"}
        </Button>
      </form>
    </div>
  );
}