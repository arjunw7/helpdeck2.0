"use client";

import { Loader2 } from "lucide-react";

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-3 rounded-lg bg-primary px-6 py-3 text-base text-primary-foreground shadow-lg">
      <Loader2 className="h-5 w-5 animate-spin" />
      HelpDeck AI is drafting your content...
    </div>
  );
}