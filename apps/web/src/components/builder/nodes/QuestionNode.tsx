"use client";

import { memo, useState, useCallback } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type QuestionFlowNode,
  type QuestionNodeData,
  QUESTION_TYPE_META,
  QUESTION_OPTION_TYPES,
  generateId,
} from "../types";

/* ─── Input preview by type ─────────────────────────────────────────────── */
function InputPreview({
  questionType,
  options,
  ratingMax,
}: {
  questionType: QuestionNodeData["questionType"];
  options: QuestionNodeData["options"];
  ratingMax: number;
}) {
  const hasOptions = (QUESTION_OPTION_TYPES as readonly string[]).includes(
    questionType
  );

  if (hasOptions && options.length > 0) {
    const preview = options.slice(0, 2);
    return (
      <div className="mt-2 space-y-1">
        {preview.map((o) => (
          <div key={o.id} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-3 w-3 rounded-xs border border-border shrink-0",
                questionType === "radio" && "rounded-full"
              )}
            />
            <span className="text-xs text-muted-foreground truncate">
              {o.label || "Option"}
            </span>
          </div>
        ))}
        {options.length > 2 && (
          <span className="text-xs text-muted-foreground/60">
            +{options.length - 2} more
          </span>
        )}
      </div>
    );
  }

  if (questionType === "rating") {
    return (
      <div className="mt-2 flex gap-1">
        {Array.from({ length: Math.min(ratingMax, 10) }, (_, index) => (
          <span key={index} className="flex h-5 w-5 items-center justify-center rounded-sm border border-border text-[10px] text-muted-foreground">
            {index + 1}
          </span>
        ))}
        {ratingMax > 10 && <span className="text-xs text-muted-foreground">…</span>}
      </div>
    );
  }

  return (
    <div className="mt-2 h-7 w-full rounded-sm border border-dashed border-border/60 bg-muted/30 flex items-center px-2">
      <span className="text-xs text-muted-foreground/50 truncate">
        {QUESTION_TYPE_META[questionType].inputPreview}
      </span>
    </div>
  );
}

/* ─── QuestionNode ──────────────────────────────────────────────────────── */
export const QuestionNode = memo(function QuestionNode({
  id,
  data,
  selected,
}: NodeProps<QuestionFlowNode>) {
  const [isHovered, setIsHovered] = useState(false);
  const { setNodes } = useReactFlow();

  const meta = QUESTION_TYPE_META[data.questionType];
  const { Icon } = meta;
  const hasError = !data.title?.trim();

  const handleDuplicate = useCallback(() => {
    setNodes((nodes) => {
      const original = nodes.find((n) => n.id === id);
      if (!original) return nodes;
      const newNode = {
        ...original,
        id: generateId(),
        position: {
          x: original.position.x + 32,
          y: original.position.y + 32,
        },
        selected: false,
        data: {
          ...(original.data as QuestionNodeData),
          options: (original.data as QuestionNodeData).options.map((o) => ({
            ...o,
            id: generateId(),
          })),
        },
      };
      return [...nodes, newNode];
    });
  }, [id, setNodes]);

  const handleDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  }, [id, setNodes]);

  return (
    <div
      className={cn(
        "blueprint-node relative w-64 rounded-xl border bg-card shadow-xs transition-all duration-200",
        "border-border",
        selected &&
          "border-primary shadow-[0_0_0_1px_hsl(var(--primary)),0_0_20px_rgba(99,102,241,0.15)]",
        !selected && isHovered && "border-border/80 shadow-md",
        hasError && !selected && "border-destructive/40"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "border-border! bg-muted! transition-all",
          (selected || isHovered) && "border-primary/60! bg-primary/30!"
        )}
      />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-primary">
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate">
            {meta.label}
          </span>
        </div>

        {/* Action menu */}
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity duration-150",
            isHovered || selected ? "opacity-100" : "opacity-0"
          )}
        >
          {hasError && (
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="nodrag flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 text-xs">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate();
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Body ───────────────────────────────── */}
      <div className="px-3.5 pt-3 pb-3">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            !data.title?.trim() && "text-muted-foreground italic"
          )}
        >
          {data.title?.trim() || "Untitled question"}
        </p>
        <InputPreview questionType={data.questionType} options={data.options} ratingMax={data.ratingMax} />
      </div>

      {/* ── Footer ─────────────────────────────── */}
      {data.required && (
        <div className="px-3.5 pb-3">
          <Badge variant="muted" className="text-[10px] px-1.5 py-0">
            Required
          </Badge>
        </div>
      )}

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "border-border! bg-muted! transition-all",
          (selected || isHovered) && "border-primary/60! bg-primary/30!"
        )}
      />
    </div>
  );
});
