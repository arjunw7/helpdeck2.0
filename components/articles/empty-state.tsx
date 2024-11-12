"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No articles yet</h3>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Get started by creating your first article to share knowledge with your users.
      </p>
      <Button onClick={onCreateClick}>
        Create Your First Article
      </Button>
    </div>
  );
}