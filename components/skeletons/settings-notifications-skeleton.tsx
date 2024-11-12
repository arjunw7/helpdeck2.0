"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SettingsNotificationsSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
        </div>
      </div>
    </Card>
  );
}