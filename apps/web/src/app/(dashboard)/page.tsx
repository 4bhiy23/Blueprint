"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  ExternalLink,
  Copy,
  Pencil,
  Trash2,
  Inbox,
  FolderLock,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface FormCardData {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  responseCount: number;
  lastEditedAt: string; // ISO date
  lastEditedLabel: string;
}

const INITIAL_MOCK_FORMS: FormCardData[] = [
  {
    id: "form_customer_feedback",
    title: "Customer Satisfaction Survey",
    description: "Gather feedback from our Q2 product beta users about the UI revamp.",
    status: "published",
    responseCount: 142,
    lastEditedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    lastEditedLabel: "2 hours ago",
  },
  {
    id: "form_beta_signup",
    title: "Developer Beta Interest List",
    description: "Sign-up form for developers wanting access to our real-time synchronization API.",
    status: "draft",
    responseCount: 0,
    lastEditedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    lastEditedLabel: "1 day ago",
  },
  {
    id: "form_hackathon_reg",
    title: "Summer Hackathon 2026 Registration",
    description: "Collect participant teams, tech stacks, and dietary details.",
    status: "published",
    responseCount: 88,
    lastEditedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    lastEditedLabel: "3 days ago",
  },
  {
    id: "form_user_research",
    title: "User Experience Research Scheduling",
    description: "Qualifying questionnaire for booking 1-on-1 feedback sessions.",
    status: "closed",
    responseCount: 312,
    lastEditedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    lastEditedLabel: "2 weeks ago",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  // State management
  const [forms, setForms] = useState<FormCardData[]>(INITIAL_MOCK_FORMS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "draft" | "published" | "closed">("all");
  const [activeSort, setActiveSort] = useState<"recent" | "newest" | "oldest" | "alpha">("recent");

  // Rename modal states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [formToRename, setFormToRename] = useState<FormCardData | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormCardData | null>(null);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Actions ──────────────────────────────────────────────────────────── */
  const handleNewForm = () => {
    const randomId = `form_${Math.random().toString(36).slice(2, 9)}`;
    toast.success("Creating new form...");
    router.push(`/forms/${randomId}`);
  };

  const handleDuplicate = (form: FormCardData) => {
    const duplicated: FormCardData = {
      ...form,
      id: `form_${Math.random().toString(36).slice(2, 9)}`,
      title: `${form.title} (Copy)`,
      responseCount: 0,
      lastEditedAt: new Date().toISOString(),
      lastEditedLabel: "Just now",
    };
    setForms([duplicated, ...forms]);
    toast.success("Form duplicated", {
      description: `Created copy of "${form.title}"`,
    });
  };

  const openRenameDialog = (form: FormCardData) => {
    setFormToRename(form);
    setRenameValue(form.title);
    setRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (!renameValue.trim()) {
      toast.error("Form title cannot be empty");
      return;
    }
    setForms(
      forms.map((f) =>
        f.id === formToRename?.id
          ? {
              ...f,
              title: renameValue.trim(),
              lastEditedAt: new Date().toISOString(),
              lastEditedLabel: "Just now",
            }
          : f
      )
    );
    setRenameDialogOpen(false);
    toast.success("Form renamed successfully");
  };

  const openDeleteDialog = (form: FormCardData) => {
    setFormToDelete(form);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!formToDelete) return;
    setForms(forms.filter((f) => f.id !== formToDelete.id));
    setDeleteDialogOpen(false);
    toast.success("Form deleted", {
      description: `"${formToDelete.title}" has been deleted.`,
    });
  };

  /* ─── Filtering & Sorting ──────────────────────────────────────────────── */
  const filteredForms = forms.filter((form) => {
    // 1. Search filter
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Status filter
    if (activeFilter === "all") return matchesSearch;
    return matchesSearch && form.status === activeFilter;
  });

  const sortedForms = [...filteredForms].sort((a, b) => {
    switch (activeSort) {
      case "alpha":
        return a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime();
      case "oldest":
        return new Date(a.lastEditedAt).getTime() - new Date(b.lastEditedAt).getTime();
      case "recent":
      default:
        // Default to recently updated
        return new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime();
    }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Forms</h1>
          <p className="text-muted-foreground text-sm">
            Manage all your forms from one place.
          </p>
        </div>

        <Button onClick={handleNewForm} className="font-semibold text-xs gap-1.5 shrink-0 self-start sm:self-auto h-8">
          <Plus className="h-4 w-4" />
          New Form
        </Button>
      </div>

      {/* ─── Controls & Filter Bar ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/20 border border-border/80 rounded-xl p-3.5 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="h-8 pl-8 pr-3 text-xs bg-muted/20 border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Filter buttons & Sort Select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters */}
          <div className="flex bg-muted/40 rounded-lg p-0.5 border border-border/60">
            {(["all", "draft", "published", "closed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all",
                  activeFilter === filter
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground/80 hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Sort Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 border-border">
                <ArrowUpDown className="h-3 w-3" />
                Sort By: {
                  activeSort === "recent"
                    ? "Recent"
                    : activeSort === "newest"
                    ? "Newest"
                    : activeSort === "oldest"
                    ? "Oldest"
                    : "Alphabetical"
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-xs" onClick={() => setActiveSort("recent")}>
                Recently Updated
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => setActiveSort("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => setActiveSort("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => setActiveSort("alpha")}>
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ─── Grid View ───────────────────────────────────────────── */}
      {loading ? (
        /* Loading skeleton state */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border/60 bg-card/30 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedForms.length === 0 ? (
        /* Empty states */
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-12 text-center bg-card/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground/80 mb-4">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">No forms found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? "We couldn't find any forms matching your search terms. Try modifying your filters."
              : "No forms have been created yet. Get started by building your first conversational form."}
          </p>
          {!searchQuery && (
            <Button onClick={handleNewForm} className="mt-4 text-xs font-semibold h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Build Your First Form
            </Button>
          )}
        </div>
      ) : (
        /* Actual Forms list grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* New form dashed card (always first) */}
          <button
            onClick={handleNewForm}
            className={cn(
              "group flex flex-col items-center justify-center border border-dashed rounded-xl p-6 bg-muted/5 transition-all text-center min-h-[175px]",
              "border-border hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all text-muted-foreground group-hover:text-primary mb-3">
              <Plus className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-foreground">Create New Form</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[180px]">
              Drag and drop nodes on an infinite canvas.
            </p>
          </button>

          {/* Form items */}
          {sortedForms.map((form) => (
            <div
              key={form.id}
              onClick={() => router.push(`/forms/${form.id}`)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-150 cursor-pointer",
                "border-border hover:border-primary/30 hover:shadow-md"
              )}
            >
              {/* Top Row: Title, status, actions */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                    {form.title}
                  </h3>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Status badge */}
                    <Badge
                      variant={
                        form.status === "published"
                          ? "success"
                          : form.status === "closed"
                          ? "destructive"
                          : "muted"
                      }
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0 font-semibold"
                    >
                      {form.status}
                    </Badge>

                    {/* Quick actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-accent/60 transition-colors">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          onClick={() => router.push(`/forms/${form.id}`)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          onClick={() => handleDuplicate(form)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          onClick={() => openRenameDialog(form)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                          onClick={() => openDeleteDialog(form)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                  {form.description || "No description provided."}
                </p>
              </div>

              {/* Bottom Row: Stats */}
              <div className="flex items-center justify-between pt-5 mt-4 border-t border-border/50 text-[10px] text-muted-foreground font-medium">
                <span>Edited {form.lastEditedLabel}</span>
                <span className="flex items-center gap-1 font-semibold text-foreground/80 bg-muted/40 px-2 py-0.5 rounded">
                  <Sparkles className="h-3 w-3 text-primary shrink-0" />
                  {form.responseCount} response{form.responseCount !== 1 && "s"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         4. MODAL DIALOGS (RENAME & DELETE)
         ───────────────────────────────────────────────────────────── */}
      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Rename Form</DialogTitle>
            <DialogDescription className="text-xs">
              Enter a new name for your form.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-left">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="e.g. Q3 Feedback Survey"
              className="text-xs h-8 focus-visible:ring-primary"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleRename}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2 text-destructive">
              <FolderLock className="h-4 w-4" />
              Delete Form
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete "{formToDelete?.title}"? This action is permanent and will delete all responses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={handleDelete}>
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}