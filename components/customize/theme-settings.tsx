"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomizeStore } from "@/stores/customize";

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Arial", label: "Arial" },
];

export function ThemeSettings() {
  const { settings, updateThemeSettings } = useCustomizeStore();

  return (
    <Card>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="accentColor">Accent Color</Label>
          <div className="flex gap-2">
            <Input
              id="accentColor"
              value={settings.theme.accentColor}
              onChange={(e) => updateThemeSettings({ accentColor: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
            <Input
              type="color"
              value={settings.theme.accentColor}
              onChange={(e) => updateThemeSettings({ accentColor: e.target.value })}
              className="w-12 p-1 h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="backgroundColor"
              value={settings.theme.backgroundColor}
              onChange={(e) => updateThemeSettings({ backgroundColor: e.target.value })}
              placeholder="#ffffff"
              className="flex-1"
            />
            <Input
              type="color"
              value={settings.theme.backgroundColor}
              onChange={(e) => updateThemeSettings({ backgroundColor: e.target.value })}
              className="w-12 p-1 h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font">Font Family</Label>
          <Select
            value={settings.theme.fontFamily || undefined}
            onValueChange={(value) => updateThemeSettings({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}