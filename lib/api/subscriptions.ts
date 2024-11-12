import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  org_id: string;
  paddle_subscription_id: string;
  paddle_customer_id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "paused";
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  has_ai_addon: boolean;
}

export async function getSubscription(orgId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSubscription(subscription: Omit<Subscription, "id">) {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert([subscription])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(id: string) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}