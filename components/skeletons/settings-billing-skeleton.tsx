"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function SettingsBillingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Skeleton className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-5 w-36 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}