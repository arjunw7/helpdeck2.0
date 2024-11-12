"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Change Logs",
    icon: FileText,
    href: "/release-notes",
  },
  {
    title: "Subscribers",
    icon: Users,
    href: "/release-notes/subscribers",
  },
];

export function SideMenu() {
  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="flex h-full w-[240px] flex-col border-r">
      <ScrollArea className="flex-1 pr-3 py-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href="/release-notes/new" className="flex-1">
              <Button
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Change Log
              </Button>
            </Link>
          </div>
          <div className="my-4 border-t" />
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="block"
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-muted font-medium"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}