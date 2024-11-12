"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, LayoutDashboard, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";
import { useAuth } from "@/hooks/use-auth";
import { LucideIcon } from "lucide-react";
import { TrialStatus } from "./trial-status";

interface PublicRoute {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface AuthenticatedRoute {
  href: string;
  root: string;
  label: string;
}

type Route = PublicRoute | AuthenticatedRoute;

export function Navigation() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { user } = useAuth();

  // Don't show navigation on knowledge base routes
  if (pathname.startsWith('/kb')) {
    return null;
  }

  const publicRoutes: PublicRoute[] = [
    {
      href: "/features",
      label: "Features",
    },
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/ai",
      label: "HelpDeck AI",
      icon: Sparkles,
    },
  ];

  const authenticatedRoutes: AuthenticatedRoute[] = [
    {
      href: "/knowledge-base",
      root: "/knowledge-base",
      label: "Knowledge Base",
    },
    {
      href: "/release-notes",
      root: "/release-notes",
      label: "Change Log",
    },
  ];
  
  const otherPrivateRoutes = ['/settings'];
  const isAuthenticatedRoute = authenticatedRoutes.some(route => pathname.includes(route.root) || otherPrivateRoutes.includes(pathname));
  const routes = isAuthenticatedRoute ? authenticatedRoutes : publicRoutes;

  return (
    <header className="sticky top-0 z-50 w-full px-[5%] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={"/"} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              HelpDeck
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => {
              const Icon = 'icon' in route ? route.icon : undefined;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80 flex items-center gap-2",
                    pathname === route.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {route.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
            <MobileNav routes={routes} pathname={pathname} />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {user && isAuthenticatedRoute && <TrialStatus />}
          </div>
          <nav className="flex items-center space-x-2">
            {user && !isAuthenticatedRoute && (
              <Link href="/knowledge-base/analytics">
                <Button variant="secondary" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
            <UserNav />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-9 px-0">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}

interface MobileNavProps {
  routes: Route[];
  pathname: string;
}

function MobileNav({ routes, pathname }: MobileNavProps) {
  return (
    <nav className="flex flex-col space-y-4">
      {routes.map((route) => {
        const Icon = 'icon' in route ? route.icon : undefined;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-foreground/60 transition-colors hover:text-foreground flex items-center gap-2",
              pathname === route.href && "text-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}