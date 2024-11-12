"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomizeStore } from "@/stores/customize";
import { ImageUpload } from "./image-upload";

export function GeneralSettings() {
  const { settings, updateGeneralSettings } = useCustomizeStore();

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          <Label htmlFor="title">Knowledge Base Title</Label>
          <Input
            id="title"
            value={settings.general.title}
            onChange={(e) => updateGeneralSettings({ title: e.target.value })}
            placeholder="Enter knowledge base title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={settings.general.description}
            onChange={(e) => updateGeneralSettings({ description: e.target.value })}
            placeholder="Enter a brief description"
          />
        </div>

        <div className="space-y-2">
          <Label>Logo</Label>
          <ImageUpload
            value={settings.general.logo}
            onChange={(url) => updateGeneralSettings({ logo: url })}
            accept="image/*"
            maxSize={2}
          />
          <p className="text-sm text-muted-foreground">
            Recommended size: 200x50px (PNG or SVG)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Favicon</Label>
          <ImageUpload
            value={settings.general.favicon}
            onChange={(url) => updateGeneralSettings({ favicon: url })}
            accept="image/x-icon,image/png"
            maxSize={1}
          />
          <p className="text-sm text-muted-foreground">
            Recommended size: 32x32px (ICO or PNG)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}