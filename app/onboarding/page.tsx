"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Steps } from "@/components/onboarding/steps";

export default function OnboardingPage() {
  const { user, organization } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    } else if (organization) {
      router.push("/knowledge-base");
    }
  }, [user, organization, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <Steps />
    </div>
  );
}