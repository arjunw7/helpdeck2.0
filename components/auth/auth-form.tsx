"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Chrome, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGithub, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    try {
      if (provider === "github") {
        await signInWithGithub();
      } else {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error("OAuth error:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to HelpDeck
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <div className="grid gap-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          className="bg-background"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          className="bg-background"
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button disabled={isLoading} className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button disabled={isLoading} className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}