"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { AlertCircle, Calendar, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SettingsBillingSkeleton } from "@/components/skeletons/settings-billing-skeleton";
import { PricingModal } from "@/components/pricing-modal";
import { Badge } from "@/components/ui/badge";

export function BillingSettings() {
  const { subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { organization } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);

  if (isLoadingSubscription) {
    return <SettingsBillingSkeleton />;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Only pass the plan ID if it exists
  const currentPlanId = subscription?.plan_id || undefined;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Subscription Details</h2>
              {subscription?.status === "trialing" && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Pro Trial
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>
          <Button onClick={() => setShowPricingModal(true)}>
            {subscription?.status === "trialing" ? "Upgrade Plan" : "Change Plan"}
          </Button>
        </div>

        {subscription?.status === "trialing" && subscription.trial_end && (
          <Alert className="mb-8 bg-primary/5 border-primary/10 pb-3">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Your Pro plan trial ends on {formatDate(subscription.trial_end)}. Upgrade now to continue using all features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex items-start space-x-4">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Current Period</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(subscription?.current_period_start || new Date().toISOString())} - {formatDate(subscription?.current_period_end || new Date().toISOString())}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Next Billing Date</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(subscription?.current_period_end || new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <PricingModal 
        open={showPricingModal} 
        onOpenChange={setShowPricingModal}
        currentPlanId={currentPlanId}
      />
    </div>
  );
}