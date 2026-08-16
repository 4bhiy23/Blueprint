"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  ChevronRight,
  Menu,
  LayoutDashboard,
  Plus,
  FileText,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FORM_UPDATED_EVENT,
  type FormRecord,
} from "@/lib/forms";
import { useFormQuery } from "@/features/forms/queries";

export default function FormDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: formDetails } = useFormQuery(formId);
  const [updatedForm, setUpdatedForm] = useState<FormRecord | null>(null);
  const form = updatedForm ?? formDetails?.form ?? null;

  useEffect(() => {
    const handleFormUpdated = (event: Event) => {
      const updatedForm = (event as CustomEvent<FormRecord>).detail;

      if (updatedForm?.id === formId) {
        setUpdatedForm(updatedForm);
      }
    };

    window.addEventListener(FORM_UPDATED_EVENT, handleFormUpdated);
    return () => window.removeEventListener(FORM_UPDATED_EVENT, handleFormUpdated);
  }, [formId]);

  // If the path is exactly "/forms/[id]/builder", render it full-screen without side navigation
  const isBuilderRoute = pathname.endsWith("/builder");
  if (isBuilderRoute) {
    return <>{children}</>;
  }

  // Navigation Links definition
  const subLinks = [
    { label: "Overview", href: `/forms/${formId}`, Icon: LayoutDashboard, exact: true },
    { label: "Builder", href: `/forms/${formId}/builder`, Icon: Plus, exact: false },
    {
      label: `Responses (${form?.responseCount ?? 0})`,
      href: `/forms/${formId}/responses`,
      Icon: FileText,
      exact: false,
    },
    { label: "Analytics", href: `/forms/${formId}/analytics`, Icon: BarChart3, exact: false },
    { label: "Settings", href: `/forms/${formId}/settings`, Icon: Settings, exact: false },
  ];

  const currentActiveLink = subLinks.find((link) => {
    if (link.exact) return pathname === link.href;
    return pathname.startsWith(link.href);
  }) || subLinks[0];

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
         PAGE HEADER (Breadcrumbs, Title, Badge)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Breadcrumb: Forms / Current Form */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Link href="/" className="hover:text-[hsl(var(--mocha-mauve))] transition-colors font-medium">
            Forms
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-50">
            {form?.title ?? "Loading form…"}
          </span>
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground truncate max-w-md sm:max-w-xl">
              {form?.title ?? "Loading form…"}
            </h1>
            <Badge
              variant={
                form?.status === "published"
                  ? "success"
                  : form?.status === "closed"
                  ? "destructive"
                  : "muted"
              }
              className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5"
            >
              {form?.status ?? "loading"}
            </Badge>
          </div>

          {/* Mobile subnavigation toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold md:hidden border border-border gap-1.5 self-start bg-card"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-3.5 w-3.5" />
            Nav: {currentActiveLink.label}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─────────────────────────────────────────────────────────────
         WORKSPACE COLUMNS (Left Sidebar + Content Area)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Side Navigation Panel (Catppuccin Mocha styled panel) */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 bg-card/60 border border-border rounded-2xl p-3.5 space-y-2.5 shadow-lg">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 border-b border-border/60 mb-1.5">
            NAVIGATION
          </div>
          {subLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link key={link.label} href={link.href}>
                <span
                  className={cn(
                    "flex items-center justify-between rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all cursor-pointer",
                    isActive
                      ? "bg-[hsl(var(--mocha-mauve))/0.15] text-[hsl(var(--mocha-mauve))] border border-[hsl(var(--mocha-mauve))/0.3] shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[hsl(var(--mocha-mauve))]" : "text-muted-foreground")} />
                    <span>{link.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--mocha-mauve))]" />}
                </span>
              </Link>
            );
          })}
        </aside>

        {/* Content Area (remaining width on the right) */}
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MOBILE SUB-NAVIGATION DRAWER
         ───────────────────────────────────────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 md:hidden" onClick={() => setMobileNavOpen(false)}>
          <div
            className="fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-card p-5 space-y-4 shadow-2xl border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Form Navigation</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileNavOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1.5">
              {subLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link key={link.label} href={link.href} onClick={() => setMobileNavOpen(false)}>
                    <span
                      className={cn(
                        "flex items-center justify-between rounded-xl py-2.5 px-3.5 text-xs font-bold transition-all cursor-pointer",
                        isActive
                          ? "bg-[hsl(var(--mocha-mauve))/0.15] text-[hsl(var(--mocha-mauve))] border border-[hsl(var(--mocha-mauve))/0.3]"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <link.Icon className="h-4 w-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--mocha-mauve))]" />}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
