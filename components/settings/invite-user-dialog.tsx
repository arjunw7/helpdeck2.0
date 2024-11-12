"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteUserDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "member",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id, role")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id || profile.role !== "owner") {
        throw new Error("Unauthorized");
      }

      // Check if user with this email already exists in the organization
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .eq("org_id", profile.org_id)
        .single();

      if (existingProfile) {
        throw new Error("User already exists in this organization");
      }

      // First, create an invitation record
      const { error: inviteError } = await supabase
        .from("invitations")
        .insert([
          {
            email: formData.email,
            role: formData.role,
            org_id: profile.org_id,
            invited_by: user.id,
            status: "pending",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          },
        ]);

      if (inviteError) throw inviteError;

      // In a real application, you would:
      // 1. Generate a secure invitation token
      // 2. Send an email with the invitation link
      // 3. Create an API endpoint to handle invitation acceptance
      // 4. Create the user account and profile when they accept

      toast.success("Invitation sent successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({ email: "", role: "member" });
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your team. They will receive an email invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}