"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  settings: KnowledgeBaseSettings;
  organizationName?: string;
  isPreview?: boolean;
}

export function Header({ settings, organizationName, isPreview }: HeaderProps) {
  return (
    <header className="border-b mx-[5%] py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
              href={isPreview ? "#" : "/kb"}
              onClick={(e) => isPreview && e.preventDefault()}
              className="text-sm hover:text-primary"
            >
          {settings.general.logo ? (
            <Image
              src={settings.general.logo}
              alt="Logo"
              width={120}
              height={30}
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-lg font-bold">
              {organizationName || settings.general.title}
            </span>
          )}
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {settings.content.showChangeLogs && (
            <Link
              href={isPreview ? "#" : "/kb/change-logs"}
              onClick={(e) => isPreview && e.preventDefault()}
              className="text-sm hover:text-primary"
            >
              Change Log
            </Link>
          )}
          {settings.navigation.menuItems.map((item) => (
            <Link
              key={item.id}
              href={isPreview ? "#" : item.url}
              className="text-sm hover:text-primary"
              onClick={(e) => isPreview && e.preventDefault()}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}