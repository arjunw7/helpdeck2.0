"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

export type UserRole = "owner" | "admin" | "member";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("member");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, org_id")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setRole(profile.role as UserRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  return { role, isLoading };
}