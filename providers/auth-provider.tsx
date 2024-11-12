"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Organization, getUserOrganization } from "@/lib/organization";

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  loading: true,
  signInWithGithub: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticatedRoute = (path: string) => {
    return ['/knowledge-base', '/release-notes', '/tickets', '/settings', '/account'].some(route => 
      path.startsWith(route)
    );
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getUserOrganization();
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setOrganization(data.organization);
        
        if (data.needsOnboarding) {
          router.push("/onboarding");
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const checkOrganization = async (skipRedirect = false) => {
    if (!user) return;
    
    try {
      const { data, error } = await getUserOrganization();
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setOrganization(data.organization);
        
        if (!skipRedirect) {
          if (data.needsOnboarding) {
            router.push("/onboarding");
          } else if (pathname === "/" || pathname === "/auth") {
            router.push("/knowledge-base/analytics");
          }
        }
      }
    } catch (error) {
      console.error("Error checking organization:", error);
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error("Failed to sign in with Google");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        setUser(data.session.user);
        const { data: orgData } = await getUserOrganization();
        
        if (orgData?.needsOnboarding) {
          router.push("/onboarding");
        } else if (orgData?.organization) {
          setOrganization(orgData.organization);
          router.push("/knowledge-base/analytics");
        }
        
        toast.success("Signed in successfully");
      }
    } catch (error) {
      toast.error("Invalid email or password");
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      toast.success("Account created! Please check your email.");
    } catch (error) {
      toast.error("Failed to create account");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setOrganization(null);
      router.push("/");
      router.refresh();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkOrganization(false);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === "SIGNED_IN") {
          await checkOrganization();
        }
      } else {
        setUser(null);
        setOrganization(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        loading,
        signInWithGithub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};