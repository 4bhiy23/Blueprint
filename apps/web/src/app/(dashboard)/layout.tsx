"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const { data: session, isPending } = authClient.useSession();
  const [searchFocused, setSearchFocused] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/signin");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} mode`);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    toast.info("Signed out successfully");
    router.replace("/auth/signin");
  };

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium animate-pulse">
            Loading Blueprint...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isBuilderRoute = pathname.endsWith("/builder");
  if (isBuilderRoute) {
    return (
      <div className="h-screen w-screen bg-background text-foreground overflow-hidden">
        {children}
      </div>
    );
  }

  const userName = session?.user?.name || "John Doe";
  const userEmail = session?.user?.email || "john@example.com";
  const userAvatarUrl = session?.user?.image || undefined;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Global top-navigation links
  const navLinks = [
    { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
    { label: "Analytics", href: "/analytics", Icon: LayoutDashboard }
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ─────────────────────────────────────────────────────────────
         GLOBAL TOP NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6 z-30">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] shadow-md group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground font-mono">
              BLUEPRINT
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href) && !pathname.startsWith("/forms");
              return (
                <Link key={link.label} href={link.href}>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-3">
          {/* Mobile navigation popover/dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold md:hidden border border-border">
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mt-1">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.label} asChild>
                  <Link href={link.href} className="w-full">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded-full border border-border focus:outline-none shrink-0 transition-opacity hover:opacity-90">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={userAvatarUrl} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none">{userName}</p>
                  <p className="text-[10px] leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => router.push("/settings")}>
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => router.push("/settings")}>
                <Settings className="h-3.5 w-3.5" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         MAIN WORKSPACE AREA
         ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        <div className={cn(
          "mx-auto h-full w-full p-4 md:p-6",
          pathname.startsWith("/forms/") ? "max-w-none" : "max-w-7xl"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
