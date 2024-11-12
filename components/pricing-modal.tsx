"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
}

export function PricingModal({ open, onOpenChange, currentPlanId }: PricingModalProps) {
  const { organization } = useAuth();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();
  
  const token = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox' 
    ? process.env.NEXT_PUBLIC_PADDLE_SANDBOX_WEBHOOK_SECRET 
    : process.env.PADDLE_PRODUCTION_WEBHOOK_SECRET;
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production';
  
  useEffect(() => {
    initializePaddle({ 
      environment, 
      token, 
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en"
        },
        eventCallback: function(data) {
          switch(data.name) {
            case "checkout.loaded":
              console.log("Checkout opened");
              break;
            case "checkout.customer.created":
              console.log("Customer created");
              break;
            case "checkout.completed":
              console.log("Checkout completed");
              break;
            default:
              console.log(data);
          }
        }
      }
    }).then(
      (paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      },
    );
  }, []);
  
  const handlePlanChange = async (plan: typeof PLANS[0]) => {
    if (!organization) {
      toast.error("Organization not found");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const priceId = plan.priceIds[environment][billingInterval];
      await paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!currentPlanId) return null;
    return PLANS.find(plan => 
      plan.priceIds.production.monthly === currentPlanId || 
      plan.priceIds.production.yearly === currentPlanId ||
      plan.priceIds.sandbox.monthly === currentPlanId ||
      plan.priceIds.sandbox.yearly === currentPlanId
    );
  };

  const currentPlan = getCurrentPlan();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <DialogHeader className="p-0">
            <DialogTitle>Change Subscription Plan</DialogTitle>
          </DialogHeader>
          <div className="inline-flex items-center rounded-lg border p-0.5 mr-8">
            <Button
              variant={billingInterval === "monthly" ? "default" : "ghost"}
              size="sm"
              className="h-7 rounded-md"
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "yearly" ? "default" : "ghost"}
              size="sm"
              className="h-7 rounded-md"
              onClick={() => setBillingInterval("yearly")}
            >
              Yearly
              <span className="ml-1 text-xs text-emerald-600">Save 30%</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const price = billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isDowngrade = currentPlan && PLANS.indexOf(plan) < PLANS.indexOf(currentPlan);

            return (
              <Card key={plan.id} className="flex flex-col p-6">
                <div className="mb-4">
                  <h3 className="font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{billingInterval}</span>
                  </div>
                  {billingInterval === "yearly" && (
                    <p className="mt-1 text-sm text-green-500">
                      Save {Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)}% with yearly billing
                    </p>
                  )}
                </div>

                <div className="flex-grow">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full h-8 rounded-md"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || isCheckoutLoading}
                    onClick={() => handlePlanChange(plan)}
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : isDowngrade ? (
                      `Downgrade to ${plan.name}`
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}