"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type SubmitFlowNode } from "../types";

export const SubmitNode = memo(function SubmitNode({
  selected,
}: NodeProps<SubmitFlowNode>) {
  return (
    <div
      className={cn(
        "blueprint-node relative flex items-center gap-2.5 rounded-full px-5 py-3 border transition-all duration-200",
        "bg-blue-500/10 border-blue-500/40 text-blue-400",
        "shadow-[0_0_20px_rgba(59,130,246,0.08)]",
        selected && "border-blue-400 shadow-[0_0_24px_rgba(59,130,246,0.2)]"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!border-blue-500/60 !bg-blue-500/30 hover:!bg-blue-400"
      />
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
      </div>
      <span className="text-sm font-semibold tracking-wide">Submit</span>
    </div>
  );
});
