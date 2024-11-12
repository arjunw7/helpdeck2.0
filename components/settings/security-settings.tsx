"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SettingsSecuritySkeleton } from "@/components/skeletons/settings-security-skeleton";

export function SecuritySettings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    async function getUserRole() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data) {
          setCurrentUserRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getUserRole();
  }, [user]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Only owners can delete their accounts
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id, role")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) {
        throw new Error("Organization not found");
      }

      if (profile.role !== "owner") {
        throw new Error("Only organization owners can delete their accounts");
      }

      // Delete all data in the correct order to handle foreign key constraints
      const orgId = profile.org_id;

      // 1. Delete release notes first since they reference both org_id and created_by
      await supabase.from("release_notes").delete().eq("org_id", orgId);

      // 2. Delete articles since they reference categories
      await supabase.from("articles").delete().eq("org_id", orgId);

      // 3. Delete categories
      await supabase.from("categories").delete().eq("org_id", orgId);

      // 4. Delete subscribers
      await supabase.from("subscribers").delete().eq("org_id", orgId);

      // 5. Delete customize settings
      await supabase.from("customize_settings").delete().eq("org_id", orgId);

      // 6. Delete subscriptions
      await supabase.from("subscriptions").delete().eq("org_id", orgId);

      // 7. Delete all other team members' profiles
      await supabase
        .from("profiles")
        .delete()
        .eq("org_id", orgId)
        .neq("id", user.id);

      // 8. Delete owner's profile
      await supabase.from("profiles").delete().eq("id", user.id);

      // 9. Delete the organization
      await supabase.from("organizations").delete().eq("id", orgId);

      // 10. Delete the auth user
      await supabase.auth.admin.deleteUser(user.id);

      // Sign out and redirect
      await signOut();
      router.push("/");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return <SettingsSecuritySkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Update your account password
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    current: e.target.value,
                  }))
                }
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords((prev) => ({ ...prev, new: e.target.value }))
                }
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </Card>

      {currentUserRole === "owner" && (
        <Card className="border-destructive p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-destructive">
                Delete Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account, organization, and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      )}
    </div>
  );
}