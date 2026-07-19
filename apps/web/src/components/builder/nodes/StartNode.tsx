"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { type StartFlowNode } from "../types";

export const StartNode = memo(function StartNode({
  selected,
}: NodeProps<StartFlowNode>) {
  return (
    <div
      className={cn(
        "blueprint-node relative flex items-center gap-2.5 rounded-full px-5 py-3 border transition-all duration-200",
        "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
        "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
        selected &&
          "border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]"
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
        <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" />
      </div>
      <span className="text-sm font-semibold tracking-wide">Start</span>

      <Handle
        type="source"
        position={Position.Right}
        className="!border-emerald-500/60 !bg-emerald-500/30 hover:!bg-emerald-400"
      />
    </div>
  );
});
