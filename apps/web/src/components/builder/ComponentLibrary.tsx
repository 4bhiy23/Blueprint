"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_META, type QuestionType } from "./types";

const QUESTION_TYPE_CATEGORIES: Array<{
  label: string;
  types: QuestionType[];
}> = [
  { label: "Text", types: ["text", "paragraph", "number", "email"] },
  { label: "Choices", types: ["select", "radio", "checkbox"] },
  { label: "Date & time", types: ["date", "datetime", "time"] },
  { label: "Feedback", types: ["rating"] },
];

/* ─── Single draggable component card ──────────────────────────────────── */
function ComponentCard({ questionType }: { questionType: QuestionType }) {
  const meta = QUESTION_TYPE_META[questionType];
  const { Icon } = meta;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${questionType}`,
    data: { questionType },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-150 cursor-grab",
        "hover:border-border/80 hover:bg-accent/40 hover:shadow-sm",
        isDragging && "opacity-40 cursor-grabbing"
      )}
    >
      {/* Type icon */}
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-none mb-1">
          {meta.label}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          {meta.description}
        </p>
      </div>

      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="mt-0.5 shrink-0 cursor-grab text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-muted-foreground active:cursor-grabbing"
        title="Drag to canvas"
      >
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}

/* ─── Component Library sidebar ─────────────────────────────────────────── */
export function ComponentLibrary() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card/40">
      {/* Header */}
      <div className="px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Components
        </h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">
          Drag onto canvas
        </p>
      </div>

      <Separator />

      {/* Question type cards */}
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-3">
          {QUESTION_TYPE_CATEGORIES.map((category) => (
            <section key={category.label} className="space-y-1.5">
              <h3 className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {category.label}
              </h3>
              {category.types.map((type) => (
                <ComponentCard key={type} questionType={type} />
              ))}
            </section>
          ))}
        </div>
        {/* Bottom padding for scroll area */}
        <div className="h-4" />
      </ScrollArea>
    </aside>
  );
}
