"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SeoSettings } from "@/hooks/use-seo-settings";

interface SeoAnalyticsFormProps {
  settings: SeoSettings;
  onUpdate: (settings: Partial<SeoSettings>) => void;
  isSaving: boolean;
}

export function SeoAnalyticsForm({ settings, onUpdate, isSaving }: SeoAnalyticsFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
      <Input
        id="googleAnalyticsId"
        value={settings.googleAnalyticsId || ""}
        onChange={(e) => onUpdate({ googleAnalyticsId: e.target.value })}
        placeholder="G-XXXXXXXXXX"
        disabled={isSaving}
      />
      <p className="text-sm text-muted-foreground">
        Enter your Google Analytics 4 Measurement ID
      </p>
    </div>
  );
}