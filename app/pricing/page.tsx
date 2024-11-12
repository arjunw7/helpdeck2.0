"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 249,
    users: 4,
    features: [
      "Up to 4 team members",
      "Unlimited articles",
      "Custom domain",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 49,
    yearlyPrice: 399,
    users: 8,
    features: [
      "Up to 8 team members",
      "Unlimited articles",
      "Change Logs",
      "Custom domain",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 129,
    yearlyPrice: 999,
    users: "Unlimited",
    features: [
      "Unlimited team members",
      "Unlimited articles",
      "Change Logs",
      "Custom domain",
      "Advanced analytics",
      "24/7 priority support",
      "Custom branding",
      "SSO authentication",
      "Custom contract",
    ],
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (monthlyPrice: number, yearlyPrice: number) => {
    return billingInterval === "monthly" ? monthlyPrice : yearlyPrice;
  };

  const getSavingsPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(savings);
  };

  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Choose the perfect plan for your team
        </p>

        <div className="flex justify-center mb-8">
          <ToggleGroup
            type="single"
            value={billingInterval}
            onValueChange={(value) => value && setBillingInterval(value as "monthly" | "yearly")}
            className="inline-flex items-center bg-muted p-1 rounded-lg"
          >
            <ToggleGroupItem
              value="monthly"
              className="px-6 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="yearly"
              className="px-6 py-2 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground"
            >
              Yearly
              <span className="ml-2 text-xs text-emerald-600 font-medium">Save up to 35%</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = getPrice(plan.monthlyPrice, plan.yearlyPrice);
          const savings = getSavingsPercentage(plan.monthlyPrice, plan.yearlyPrice);

          return (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-8">
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-muted-foreground">/{billingInterval}</span>
                  {billingInterval === "yearly" && (
                    <p className="mt-1 text-sm text-green-500">Save {savings}% with yearly billing</p>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/auth" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-16">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="mr-2 h-6 w-6" />
              HelpDeck AI Add-on
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Supercharge your knowledge base with AI-powered features
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold">
                ${billingInterval === "monthly" ? "49" : "399"}
              </span>
              <span>/{billingInterval}</span>
              {billingInterval === "yearly" && (
                <p className="mt-1 text-sm text-primary-foreground/80">Save 32% with yearly billing</p>
              )}
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                AI-powered article generation
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Smart content suggestions
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Advanced semantic search
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/ai" className="w-full">
              <Button className="w-full" variant="secondary">Learn More</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}