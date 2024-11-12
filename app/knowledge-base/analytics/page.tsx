"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, FileText, Users, Eye } from "lucide-react";

const stats = [
  {
    title: "Total Articles",
    value: "124",
    icon: FileText,
    description: "12 added this month",
  },
  {
    title: "Total Views",
    value: "45.2K",
    icon: Eye,
    description: "+20% from last month",
  },
  {
    title: "Unique Visitors",
    value: "12.5K",
    icon: Users,
    description: "+15% from last month",
  },
  {
    title: "Avg. Time on Page",
    value: "3m 45s",
    icon: BarChart,
    description: "+5% from last month",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="px-[20px] space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}