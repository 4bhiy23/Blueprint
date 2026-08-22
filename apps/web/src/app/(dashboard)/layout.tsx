"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BlueprintLogo } from "@/components/brand/BlueprintLogo";
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
         GLOBAL TOP NAVIGATION BAR — Hand-Drawn Blueprint Ink Style
         ───────────────────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b-2 border-[hsl(var(--foreground))] bg-[hsl(var(--background))] px-4 md:px-6 z-30 shadow-[0_2px_0_0_hsl(var(--foreground))]">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <BlueprintLogo showText={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href) && !pathname.startsWith("/forms");
              return (
                <Link key={link.label} href={link.href}>
                  <span
                    className={cn(
                      "px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer border-2 border-transparent font-mono rounded-lg",
                      isActive
                        ? "bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] border-[hsl(var(--foreground))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                        : "text-slate-600 hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--foreground))/0.4]"
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

          {/* Profile Dropdown Trigger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded-full border-2 border-[hsl(var(--foreground))] bg-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))] focus:outline-hidden shrink-0 transition-transform hover:scale-105 active:translate-x-px active:translate-y-px">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatarUrl} />
                  <AvatarFallback className="text-xs font-bold font-mono bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))]">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal border-b-2 border-[hsl(var(--foreground))/0.1] pb-2 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-bold font-doodle text-[hsl(var(--foreground))] leading-none">{userName}</p>
                  <p className="text-[10px] font-mono leading-none text-slate-500">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 text-xs font-bold font-mono text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))] focus:bg-red-50" onClick={handleSignOut}>
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
