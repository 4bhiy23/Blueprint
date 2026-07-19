"use client";

import { useState } from "react";
import { Eye, Globe, LayoutGrid, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TopNavProps {
  formTitle: string;
  onFormTitleChange: (title: string) => void;
}

export function TopNav({ formTitle, onFormTitleChange }: TopNavProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(formTitle);

  const handleTitleCommit = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleDraft(formTitle);
    } else {
      onFormTitleChange(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handlePublish = () => {
    toast.success("Form published!", {
      description: "Your form is now live and accepting responses.",
      duration: 4000,
    });
  };

  const handlePreview = () => {
    toast.info("Preview mode", {
      description: "Preview will be available soon.",
      duration: 2500,
    });
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-sm">
      {/* ── Left: Logo + Title ──────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Blueprint logo mark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <LayoutGrid className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground hidden sm:block">
            Blueprint
          </span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Editable form title */}
        {isEditingTitle ? (
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
              className="h-7 w-48 text-sm border-primary/50 bg-card px-2 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              onClick={handleTitleCommit}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setTitleDraft(formTitle);
              setIsEditingTitle(true);
            }}
            className={cn(
              "group flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors",
              "hover:bg-accent"
            )}
          >
            <span className="max-w-[200px] truncate text-sm font-medium text-foreground">
              {formTitle}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
          </button>
        )}
      </div>

      {/* ── Right: Actions ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreview}
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>

        <Button
          size="sm"
          onClick={handlePublish}
          className="h-7 gap-1.5 text-xs font-semibold"
        >
          <Globe className="h-3.5 w-3.5" />
          Publish
        </Button>
      </div>
    </header>
  );
}
