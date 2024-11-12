import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Search, Palette, BarChart2, Shield, Puzzle, Sparkles, FileText } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Content Management",
    description: "Organize and manage your documentation with ease using our intuitive content management system.",
    icon: FileText,
  },
  {
    title: "Powerful Editor",
    description: "Create beautiful documentation with our rich text editor supporting Markdown, code blocks, and media.",
    icon: Edit3,
  },
  {
    title: "AI-Powered Search",
    description: "Help users find exactly what they need with our intelligent search powered by advanced algorithms.",
    icon: Search,
  },
  {
    title: "Custom Branding",
    description: "Make your help center truly yours with customizable themes, logos, and domain settings.",
    icon: Palette,
  },
  {
    title: "Advanced Analytics",
    description: "Gain insights into how users interact with your documentation to improve content strategy.",
    icon: BarChart2,
  },
  {
    title: "Robust Security",
    description: "Keep your content secure with role-based access control and enterprise-grade security.",
    icon: Shield,
  },
  {
    title: "Seamless Integrations",
    description: "Connect with your favorite tools including Slack, GitHub, and more.",
    icon: Puzzle,
  },
  {
    title: "AI Assistance",
    description: "Let AI help you create, improve, and maintain your documentation.",
    icon: Sparkles,
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Powerful Features for Modern Documentation</h1>
        <p className="mb-16 text-lg text-muted-foreground">
          Everything you need to create, manage, and scale your knowledge base
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="relative overflow-hidden">
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

      <div className="mt-16 text-center">
        <Link href="/auth">
          <Button size="lg">Get Started Free</Button>
        </Link>
      </div>
    </div>
  );
}