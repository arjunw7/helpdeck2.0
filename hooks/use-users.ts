"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { UserRole } from "@/hooks/use-user-role";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  active: boolean;
}

export function useUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, active")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const inviteUser = async ({ email, role }: { email: string; role: UserRole }) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) throw new Error("Organization not found");

      // In a real app, you would:
      // 1. Create a pending invitation record
      // 2. Send an email with an invitation link
      // 3. Handle the invitation acceptance flow
      // For now, we'll simulate by creating a new profile directly
      const { error } = await supabase
        .from("profiles")
        .insert([
          {
            email,
            role,
            org_id: profile.org_id,
            active: true,
          },
        ]);

      if (error) throw error;

      toast.success("Invitation sent successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to send invitation");
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const { error } = await supabase
        .from("profiles")
        .update({ active: !userToUpdate.active })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User ${userToUpdate.active ? "deactivated" : "activated"} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  return {
    users,
    isLoading,
    inviteUser,
    updateUserRole,
    deactivateUser,
  };
}