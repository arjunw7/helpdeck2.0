"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsSkeleton() {
  return (
    <div className="container py-8">
      <Tabs defaultValue="general" className="space-y-8">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <div className="grid gap-6">
          {/* Organization Settings */}
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-4 w-[240px]" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-32" />
                    <Skeleton className="h-10 w-full max-w-[300px]" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Settings */}
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-10 w-full max-w-[300px]" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}