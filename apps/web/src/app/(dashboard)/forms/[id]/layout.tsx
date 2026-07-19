"use client";

import React, { useState } from "react";
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

/* ─── Mock DB lookup by dynamic ID ─────────────────────────────────────── */
interface FormDetailsData {
  id: string;
  title: string;
  status: "draft" | "published" | "closed";
}

const MOCK_FORMS_DB: Record<string, FormDetailsData> = {
  form_customer_feedback: {
    id: "form_customer_feedback",
    title: "Customer Satisfaction Survey",
    status: "published",
  },
  form_beta_signup: {
    id: "form_beta_signup",
    title: "Developer Beta Interest List",
    status: "draft",
  },
  form_hackathon_reg: {
    id: "form_hackathon_reg",
    title: "Summer Hackathon 2026 Registration",
    status: "published",
  },
  form_user_research: {
    id: "form_user_research",
    title: "User Experience Research Scheduling",
    status: "closed",
  },
};

const DEFAULT_FORM: FormDetailsData = {
  id: "new_form",
  title: "Untitled Form",
  status: "draft",
};

export default function FormDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const form = MOCK_FORMS_DB[formId] || { ...DEFAULT_FORM, id: formId };

  // If the path is exactly "/forms/[id]/builder", render it full-screen without side navigation
  const isBuilderRoute = pathname.endsWith("/builder");
  if (isBuilderRoute) {
    return <>{children}</>;
  }

  // Navigation Links definition
  const subLinks = [
    { label: "Overview", href: `/forms/${formId}`, Icon: LayoutDashboard, exact: true },
    { label: "Builder", href: `/forms/${formId}/builder`, Icon: Plus, exact: false },
    { label: "Responses", href: `/forms/${formId}/responses`, Icon: FileText, exact: false },
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
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors font-medium">
            Forms
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {form.title}
          </span>
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate max-w-md sm:max-w-xl">
              {form.title}
            </h1>
            <Badge
              variant={
                form.status === "published"
                  ? "success"
                  : form.status === "closed"
                  ? "destructive"
                  : "muted"
              }
              className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5"
            >
              {form.status}
            </Badge>
          </div>

          {/* Mobile subnavigation toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold md:hidden border border-border gap-1.5 self-start"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-3.5 w-3.5" />
            Navigation: {currentActiveLink.label}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─────────────────────────────────────────────────────────────
         WORKSPACE COLUMNS (Left Sidebar + Content Area)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Side Navigation Panel (Desktop only, Github/Vercel style) */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 space-y-2.5">
          {subLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link key={link.label} href={link.href}>
                <span
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg py-1.5 px-3 text-xs font-semibold transition-all cursor-pointer border-l-2",
                    isActive
                      ? "bg-accent/70 border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                  )}
                >
                  <link.Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{link.label}</span>
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
            className="fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col bg-card p-5 space-y-4 shadow-xl border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Form Navigation</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileNavOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1">
              {subLinks.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <Link key={link.label} href={link.href} onClick={() => setMobileNavOpen(false)}>
                    <span
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg py-2 px-3 text-xs font-semibold transition-colors cursor-pointer",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      )}
                    >
                      <link.Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{link.label}</span>
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
