"use client";

import { SideMenu } from "@/components/release-notes/side-menu";

export default function ReleaseNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] mx-[5%]">
      <SideMenu />
      <main className="flex-1 overflow-y-auto">
        <div className="py-4">{children}</div>
      </main>
    </div>
  );
}