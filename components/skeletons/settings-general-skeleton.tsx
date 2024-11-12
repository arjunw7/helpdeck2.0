"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SettingsGeneralSkeleton() {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-32" />
              <Skeleton className="h-10 w-full max-w-[300px]" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-10 w-full max-w-[300px]" />
              <Skeleton className="h-4 w-48" />
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