"use client";

import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <FolderPlus className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
      <p className="mt-2 mb-4 text-sm text-muted-foreground">
        Get started by creating your first category to organize your knowledge base content.
      </p>
      <Button onClick={onCreateClick}>
        Create Your First Category
      </Button>
    </div>
  );
}