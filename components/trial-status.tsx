"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingModal } from "@/components/pricing-modal";
import { differenceInDays } from "date-fns";
import { Loader2, Crown } from "lucide-react";

export function TrialStatus() {
  const { subscription, isLoading } = useSubscription();
  const [showPricing, setShowPricing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // If already subscribed, don't show trial status
  if (subscription?.status === "active") {
    return null;
  }

  const trialEndDate = subscription?.trial_end 
    ? new Date(subscription.trial_end)
    : null;

  if (!trialEndDate) {
    return null;
  }

  const today = new Date();
  const daysLeft = differenceInDays(trialEndDate, today);

  if (daysLeft <= 0) {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-md px-3 h-9">
        <span className="text-xs font-medium text-destructive">Trial expired</span>
        <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => setShowPricing(true)}>
          Upgrade Now
        </Button>
        <PricingModal open={showPricing} onOpenChange={setShowPricing} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-muted rounded-md px-3 h-9 gap-3">
      <div className="flex items-center gap-2">
        <Crown className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium">
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </span>
      </div>
      <Button 
        size="sm" 
        variant="default"
        className="h-6 px-2 text-xs font-medium" 
        onClick={() => setShowPricing(true)}
      >
        Upgrade
      </Button>
      <PricingModal open={showPricing} onOpenChange={setShowPricing} />
    </div>
  );
}