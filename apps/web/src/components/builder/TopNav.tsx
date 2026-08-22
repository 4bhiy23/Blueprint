"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Globe, Pencil, Check, Loader2, CloudCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FORM_UPDATED_EVENT, type FormStatus } from "@/lib/forms";
import { useFormMutations } from "@/features/forms/queries";
import { BlueprintLogo } from "@/components/brand/BlueprintLogo";

interface TopNavProps {
  formId: string;
  formTitle: string;
  publicId: string | null;
  status: FormStatus;
  onFormTitleChange: (title: string) => void;
  onStatusChange: (status: FormStatus) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSaveStatusChange: (status: "idle" | "saving" | "saved" | "error") => void;
  readOnly?: boolean;
}

export function TopNav({
  formId,
  formTitle,
  publicId,
  status,
  onFormTitleChange,
  onStatusChange,
  saveStatus,
  onSaveStatusChange,
  readOnly = false,
}: TopNavProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(formTitle);
  const [publishing, setPublishing] = useState(false);
  const { update } = useFormMutations();

  // Sync draft title with incoming prop changes
  useEffect(() => {
    setTitleDraft(formTitle);
  }, [formTitle]);

  const handleTitleCommit = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleDraft(formTitle);
    } else if (trimmed !== formTitle) {
      onFormTitleChange(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    onSaveStatusChange("saving");

    try {
      const response = await update.mutateAsync({
        formId,
        status: "published",
      });
      onStatusChange("published");
      onSaveStatusChange("saved");
      
      // Dispatch event to sync page overview layouts
      window.dispatchEvent(
        new CustomEvent(FORM_UPDATED_EVENT, { detail: response.form })
      );

      toast.success("Form published!", {
        description: "Your form is now live and accepting responses.",
        duration: 4000,
      });
    } catch (error) {
      onSaveStatusChange("error");
      toast.error(
        error instanceof Error ? error.message : "Unable to publish form."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = () => {
    if (!publicId) {
      toast.error("Form has no public link yet.");
      return;
    }
    window.open(`/f/${publicId}`, "_blank");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-[hsl(var(--foreground))] bg-[hsl(var(--background))] px-4 shadow-[0_2px_0_0_hsl(var(--foreground))] z-30">
      {/* ── Left: Logo + Title + Autosave Indicator ──────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Blueprint logo mark */}
        <Link
          href="/dashboard"
          aria-label="Go to dashboard"
          className="flex items-center gap-2 shrink-0 rounded-md focus-visible:outline-hidden"
        >
          <BlueprintLogo showText={true} />
        </Link>

        <Separator orientation="vertical" className="h-5 bg-[hsl(var(--foreground))/0.2]" />

        {/* Editable form title */}
        {isEditingTitle && !readOnly ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleCommit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleCommit();
                if (e.key === "Escape") {
                  setTitleDraft(formTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="h-7 w-44 sm:w-52 text-sm border-primary/50 bg-card px-2 focus-visible:ring-1 focus-visible:ring-primary text-slate-100 font-medium"
            />
            <button
              onClick={handleTitleCommit}
              className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : readOnly ? (
          <span className="max-w-[140px] sm:max-w-[220px] truncate px-1.5 py-0.5 text-sm font-semibold text-foreground">
            {formTitle}
          </span>
        ) : (
          <button
            onClick={() => {
              setTitleDraft(formTitle);
              setIsEditingTitle(true);
            }}
            className={cn(
              "group flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors cursor-pointer",
              "hover:bg-accent"
            )}
          >
            <span className="max-w-[140px] sm:max-w-[220px] truncate text-sm font-semibold text-foreground">
              {formTitle}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
          </button>
        )}

        {/* Autosave API Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1 sm:ml-2 select-none transition-all duration-200">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[10px] font-medium text-primary">Saving...</span>
            </div>
          )}
          {!readOnly && (saveStatus === "saved" || saveStatus === "idle") && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CloudCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">Saved</span>
            </div>
          )}
          {readOnly ? (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400">Editing locked</span>
            </div>
          ) : saveStatus === "error" && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-[10px] font-medium text-rose-400">Error saving</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Actions ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreview}
          className="h-7.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border border-border/30 hover:bg-slate-900"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>

        {status !== "published" ? (
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
            className="h-7.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/95 text-white cursor-pointer rounded-lg px-3.5 shadow-md"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            Publish
          </Button>
        ) : (
          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md tracking-wider">
            Published
          </span>
        )}
      </div>
    </header>
  );
}
