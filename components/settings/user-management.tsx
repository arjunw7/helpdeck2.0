"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { InviteUserDialog } from "./invite-user-dialog";
import { SettingsUsersSkeleton } from "@/components/skeletons/settings-users-skeleton";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "owner" | "admin" | "member";
  active: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "accepted" | "expired";
  created_at: string;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | null>(null);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id, role")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) return;

      setCurrentUserRole(profile.role);

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, active")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: true });

      if (usersError) throw usersError;
      setUsers(users);

      // Fetch pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from("invitations")
        .select("id, email, role, status, created_at")
        .eq("org_id", profile.org_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (invitesError) throw invitesError;
      setInvitations(invites);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!user || currentUserRole !== "owner") return;

    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as "owner" | "admin" | "member" } : u
      ));
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setIsUpdating(null);
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: boolean) => {
    if (!user || (currentUserRole !== "owner" && currentUserRole !== "admin")) return;

    setIsUpdating(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active: newStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, active: newStatus } : u
      ));
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(null);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      // Update the expiration date
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 7); // 7 days from now

      const { error } = await supabase
        .from("invitations")
        .update({
          expires_at: newExpiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", invitationId);

      if (error) throw error;

      // In a real app, you would also:
      // 1. Generate a new invitation token
      // 2. Send a new invitation email

      toast.success("Invitation resent successfully");
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation");
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      setIsUpdating(invitationId);

      const { error } = await supabase
        .from("invitations")
        .update({
          status: "expired",
          updated_at: new Date().toISOString()
        })
        .eq("id", invitationId)
        .eq("status", "pending");

      if (error) throw error;

      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      toast.success("Invitation cancelled successfully");
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    } finally {
      setIsUpdating(null);
    }
  };

  const canManageUsers = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  if (isLoading) {
    return <SettingsUsersSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Team Members</h2>
            <p className="text-sm text-muted-foreground">
              Manage your team members and their roles
            </p>
          </div>
          {canManageUsers && (
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {canManageUsers && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isOwner && user.role !== "owner" ? (
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value)}
                        disabled={isUpdating === user.id}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {canManageUsers && (
                    <TableCell>
                      {user.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, !user.active)}
                          disabled={isUpdating === user.id}
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}

              {/* Pending Invitations */}
              {invitations.map((invitation) => (
                <TableRow key={invitation.id} className="bg-muted/50">
                  <TableCell>Pending User</TableCell>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending Invite
                    </Badge>
                  </TableCell>
                  {canManageUsers && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendInvitation(invitation.id)}
                          disabled={isUpdating === invitation.id}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          disabled={isUpdating === invitation.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={fetchUsers}
      />
    </div>
  );
}