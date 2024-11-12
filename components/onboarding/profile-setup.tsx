"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileSetupProps {
  onSubmit: (data: any) => void;
}

export function ProfileSetup({ onSubmit }: ProfileSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get("fullName"),
      avatar_url: avatar,
    };

    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      // For now, create object URL
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Complete Your Profile</h2>
        <p className="text-sm text-muted-foreground">
          Add your personal information
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="avatar">Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Completing Setup..." : "Complete Setup"}
      </Button>
    </form>
  );
}