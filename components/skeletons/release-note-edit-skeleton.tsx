"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ReleaseNoteEditSkeleton() {
  return (
    <div className="container max-w-5xl py-4 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="rounded-lg border">
                <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>
    </div>
  );
}