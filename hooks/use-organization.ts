"use client";

import { useEffect, useState } from "react";
import { Organization, getUserOrganization } from "@/lib/organization";
import { useRouter } from "next/navigation";

export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkOrganization() {
      try {
        setLoading(true);
        const { data, error } = await getUserOrganization();

        if (error) {
          setError(error);
          return;
        }

        if (data?.needsOnboarding) {
          router.push("/onboarding");
          return;
        }

        if (data?.organization) {
          setOrganization(data.organization);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load organization");
      } finally {
        setLoading(false);
      }
    }

    checkOrganization();
  }, [router]);

  return { organization, loading, error };
}