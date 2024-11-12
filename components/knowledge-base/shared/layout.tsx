"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import { ThemeProvider } from "@/components/theme-provider";

interface KnowledgeBaseLayoutProps {
  settings: KnowledgeBaseSettings;
  children: React.ReactNode;
}

export function KnowledgeBaseLayout({ settings, children }: KnowledgeBaseLayoutProps) {
  const getTextColor = (bgColor: string) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return 'black';
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

  // Get font family with fallback
  const getFontFamily = () => {
    const configuredFont = settings.theme.fontFamily;
    return configuredFont ? `${configuredFont}, Arial, sans-serif` : 'Arial, sans-serif';
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div 
        className="min-h-screen pb-1"
        style={{ 
          backgroundColor: settings.theme.backgroundColor,
          color: getTextColor(settings.theme.backgroundColor),
          fontFamily: getFontFamily(),
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}