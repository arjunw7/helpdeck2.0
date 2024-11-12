"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SubscribeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscribeModal({ open, onOpenChange }: SubscribeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Check if email already exists
      const { data: existingSubscriber } = await supabase
        .from("subscribers")
        .select("id")
        .eq("email", email)
        .single();

      if (existingSubscriber) {
        toast.error("This email is already subscribed");
        return;
      }

      // Get organization ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .single();

      if (!profile?.org_id) {
        throw new Error("Organization not found");
      }

      // Create subscriber
      const { error } = await supabase
        .from("subscribers")
        .insert([
          {
            email,
            org_id: profile.org_id,
            created_by: profile.org_id,
            updated_by: profile.org_id,
          },
        ]);

      if (error) throw error;

      toast.success("Successfully subscribed to updates!");
      onOpenChange(false);
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subscribe to Updates</DialogTitle>
          <DialogDescription>
            Get notified when new change logs are published.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}