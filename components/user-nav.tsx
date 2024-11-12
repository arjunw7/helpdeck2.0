"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Profile {
  avatar_url: string;
  full_name: string;
  email: string;
}

export function UserNav() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    async function getProfile() {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setProfile({
          ...data,
          email: user.email || "",
          avatar_url: data?.avatar_url || "",
          full_name: data?.full_name || user.email?.split("@")[0] || "",
        });
      }
    }
    
    if (user) {
      getProfile();
    }
  }, [user]);

  if (!user) {
    return (
      <Link href="/auth">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const handleSignOut = async () => {
    setShowSignOutDialog(false);
    await signOut();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center gap-2 p-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback>
                {getInitials(profile?.full_name || profile?.email?.split("@")[0] || "")}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">{profile?.full_name}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/settings">
            <DropdownMenuItem>
              Account Settings
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setShowSignOutDialog(true)}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}