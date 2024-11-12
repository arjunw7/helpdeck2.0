"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export interface Subscription {
  id: string;
  status: "trialing" | "active" | "past_due" | "paused" | "canceled";
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  trial_end: string;
  has_ai_addon: boolean;
}

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) return null;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("org_id", profile.org_id)
        .single();

      return subscription as Subscription | null;
    },
    enabled: !!user,
  });

  return {
    subscription,
    isLoading,
    error,
  };
}