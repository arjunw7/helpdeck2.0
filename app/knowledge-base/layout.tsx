"use client";

import { SideMenu } from "@/components/knowledge-base/side-menu";
import { usePathname } from "next/navigation";

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRootPath = pathname === "/knowledge-base";

  return (
    <div className="flex h-[calc(100vh-3.5rem)] mx-[5%]">
      <SideMenu />
      <main className="flex-1 overflow-y-auto">
        <div className="py-4">{children}</div>
      </main>
    </div>
  );
}