import { Button } from "@/components/ui/button";
import { BookOpen, Github, Mail, Search, Users, Zap, BookMarked, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),theme(colors.background))]" />
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Create Beautiful Help Centers for Your SaaS
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Build a knowledge base that your customers will love. Easy to set up, customize, and maintain.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth">
              <Button size="lg" className="min-w-[200px]">
                <Zap className="mr-2 h-4 w-4" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/demo" className="text-sm font-semibold leading-6">
              View Demo <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Everything you need for your help center</h2>
          <p className="text-muted-foreground">Powerful features to make your documentation shine</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-8">
            <Search className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Powerful Search</h3>
            <p className="text-sm text-muted-foreground">
              Lightning-fast search with typo tolerance and instant results.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <BookMarked className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Organized Categories</h3>
            <p className="text-sm text-muted-foreground">
              Keep your documentation organized with nested categories and tags.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <Globe className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Custom Domain</h3>
            <p className="text-sm text-muted-foreground">
              Host your help center on your own domain with SSL included.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <Users className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Team Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Work together with your team to create and maintain documentation.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <BookOpen className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Rich Content Editor</h3>
            <p className="text-sm text-muted-foreground">
              Write documentation with a powerful Markdown editor and media support.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8">
            <Zap className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track how users interact with your documentation and improve it.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50">
        <div className="container py-24 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-muted-foreground">
            Create your help center in minutes. No credit card required.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth">
              <Button size="lg" className="min-w-[200px]">
                <Mail className="mr-2 h-4 w-4" />
                Start for Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="min-w-[200px]">
                <Github className="mr-2 h-4 w-4" />
                Login with GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}