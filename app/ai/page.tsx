import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Search, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "AI-Powered Content Generation",
    description: "Generate high-quality documentation automatically from your existing content, code, or specifications.",
    icon: Bot,
  },
  {
    title: "Smart Content Suggestions",
    description: "Get intelligent suggestions for improving your documentation based on user behavior and feedback.",
    icon: Sparkles,
  },
  {
    title: "Advanced Semantic Search",
    description: "Help users find exactly what they need with AI-powered search that understands context and intent.",
    icon: Search,
  },
  {
    title: "Automated Updates",
    description: "Keep your documentation up-to-date automatically as your product evolves.",
    icon: Zap,
  },
];

export default function AIPage() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold">HelpDeck AI</h1>
        <p className="mb-16 text-lg text-muted-foreground">
          Transform your documentation with the power of artificial intelligence
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 space-y-8 rounded-lg bg-primary p-8 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Experience the Future of Documentation</h2>
          <p className="text-lg opacity-90">
            Add HelpDeck AI to your plan for just $89/month and revolutionize how you create and maintain documentation.
          </p>
        </div>

        <div className="text-center">
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}