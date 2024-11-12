"use client";

import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/customize/image-upload";
import type { SeoSettings } from "@/hooks/use-seo-settings";

interface SeoImagesFormProps {
  settings: SeoSettings;
  onUpdate: (settings: Partial<SeoSettings>) => void;
  isSaving: boolean;
}

export function SeoImagesForm({ settings, onUpdate, isSaving }: SeoImagesFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Social Share Image</Label>
        <ImageUpload
          value={settings.ogImage}
          onChange={(url) => onUpdate({ ogImage: url })}
          accept="image/*"
          maxSize={2}
        />
        <p className="text-sm text-muted-foreground">
          Recommended size: 1200x630px (PNG or JPG)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Favicon</Label>
        <ImageUpload
          value={settings.favicon}
          onChange={(url) => onUpdate({ favicon: url })}
          accept="image/x-icon,image/png"
          maxSize={1}
        />
        <p className="text-sm text-muted-foreground">
          Recommended size: 32x32px (ICO or PNG)
        </p>
      </div>
    </div>
  );
}