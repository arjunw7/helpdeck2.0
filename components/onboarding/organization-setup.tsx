"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES } from "@/lib/constants";

interface OrganizationSetupProps {
  onSubmit: (data: any) => void;
}

export function OrganizationSetup({ onSubmit }: OrganizationSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      timezone: formData.get("timezone"),
      logo: logo,
    };

    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      // For now, create object URL
      setLogo(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Setup Your Organization</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your organization
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter organization name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select name="timezone" required>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Organization Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {logo && (
            <div className="mt-2">
              <img
                src={logo}
                alt="Organization logo preview"
                className="h-20 w-20 rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Setting up..." : "Continue"}
      </Button>
    </form>
  );
}