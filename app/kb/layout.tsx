"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { KnowledgeBaseSettings } from "@/stores/customize";
import { ThemeProvider } from "@/components/theme-provider";

interface KnowledgeBaseLayoutProps {
  children: React.ReactNode;
}

export default function KnowledgeBaseLayout({ children }: KnowledgeBaseLayoutProps) {
  const [settings, setSettings] = useState<KnowledgeBaseSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/kb/settings");
        const data = await response.json();
        
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error loading knowledge base settings:', error);
      }
    }

    loadSettings();
  }, [pathname]);

  if (!settings) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div 
        style={{ 
          backgroundColor: settings.theme.backgroundColor,
          color: settings.theme.textColor,
          fontFamily: settings.theme.fontFamily || undefined,
        }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}