"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeroProps {
  settings: KnowledgeBaseSettings;
  onSearch?: (query: string) => void;
}

export function Hero({ settings, onSearch }: HeroProps) {
  const getTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return 'white';
    const luminance = getLuminance(rgb);
    return luminance < 0.5 ? 'white' : 'black';
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = ({ r, g, b }: { r: number, g: number, b: number }) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const textColor = getTextColor(settings.theme.accentColor);

  return (
    <div 
      className="px-[5%] pt-8 pb-20"
      style={{ 
        backgroundColor: settings.theme.accentColor,
        color: textColor,
      }}
    >
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">{settings.general.title}</h1>
        <p className="mb-8 text-l opacity-90">
          {settings.general.description}
        </p>
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for answers..."
              className="pl-10"
              onChange={(e) => onSearch?.(e.target.value)}
              style={{
                backgroundColor: `${textColor === 'white' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.1)'}`,
                borderColor: `${textColor === 'white' ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.2)'}`,
                color: textColor === 'white' ? 'black' : textColor,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}