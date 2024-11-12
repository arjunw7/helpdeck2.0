"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SeoSettings } from "@/hooks/use-seo-settings";

interface SeoMetaFormProps {
  settings: SeoSettings;
  onUpdate: (settings: Partial<SeoSettings>) => void;
  isSaving: boolean;
}

export function SeoMetaForm({ settings, onUpdate, isSaving }: SeoMetaFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="metaTitle">Meta Title</Label>
        <Input
          id="metaTitle"
          value={settings.metaTitle || ""}
          onChange={(e) => onUpdate({ metaTitle: e.target.value })}
          placeholder="Knowledge Base - Your Company Name"
          disabled={isSaving}
        />
        <p className="text-sm text-muted-foreground">
          Recommended length: 50-60 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta Description</Label>
        <Textarea
          id="metaDescription"
          value={settings.metaDescription || ""}
          onChange={(e) => onUpdate({ metaDescription: e.target.value })}
          placeholder="A brief description of your knowledge base"
          rows={3}
          disabled={isSaving}
        />
        <p className="text-sm text-muted-foreground">
          Recommended length: 150-160 characters
        </p>
      </div>
    </div>
  );
}