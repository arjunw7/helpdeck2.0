"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart2,
  FolderOpen,
  FileText,
  Paintbrush,
  Plus,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CategoryModal } from "@/components/categories/category-modal";
import { useCategories } from "@/hooks/use-categories";
import { useState } from "react";

const menuItems = [
  {
    title: "Analytics",
    icon: BarChart2,
    href: "/knowledge-base",
  },
  {
    title: "Categories",
    icon: FolderOpen,
    href: "/knowledge-base/categories",
  },
  {
    title: "Articles",
    icon: FileText,
    href: "/knowledge-base/articles",
  },
  {
    title: "Customize",
    icon: Paintbrush,
    href: "/knowledge-base/customize",
    matchPaths: ["/knowledge-base/customize", "/knowledge-base/customize/preview"],
  },
  {
    title: "Domain & SEO",
    icon: Globe,
    href: "/knowledge-base/domain-seo",
  },
];

export function SideMenu() {
  const pathname = usePathname();
  const { categories } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const isActiveRoute = (item: typeof menuItems[0]) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => pathname.startsWith(path));
    }
    return pathname === item.href;
  };

  return (
    <div className="flex h-full w-[240px] flex-col border-r">
      <ScrollArea className="flex-1 pr-3 py-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href="/knowledge-base/articles/new" className="flex-1">
              <Button
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="w-full justify-start"
              variant="outline"
              onClick={() => setShowCategoryModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </div>
          <div className="my-4 border-t" />
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item);

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

      <CategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        categories={categories}
      />
    </div>
  );
}