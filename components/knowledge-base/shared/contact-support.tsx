"use client";

import { KnowledgeBaseSettings } from "@/stores/customize";
import Link from "next/link";

interface ContactSupportProps {
  settings: KnowledgeBaseSettings;
  isPreview?: boolean;
}

export function ContactSupport({ settings, isPreview }: ContactSupportProps) {
  return (
    <div className="rounded-lg bg-muted p-8 text-center my-6 mx-[5%]">
      <h2 className="mb-2 text-lg font-semibold">Need More Help?</h2>
      <p className="text-sm text-muted-foreground">
        Contact our support team at{" "}
        <Link
          href={isPreview ? "#" : `mailto:${settings.content.contactEmail}`}
          onClick={(e) => isPreview && e.preventDefault()}
          className="text-primary hover:underline"
        >
          {settings.content.contactEmail}
        </Link>
      </p>
    </div>
  );
}