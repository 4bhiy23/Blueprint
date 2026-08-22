import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 border-[hsl(var(--foreground))] px-2.5 py-0.5 text-xs font-bold font-mono transition-transform focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:rotate-1",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-white shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        outline: "bg-white text-[hsl(var(--foreground))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        success:
          "bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] border-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--primary))]",
        warning:
          "bg-amber-50 text-amber-900 border-amber-800 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        info:
          "bg-[hsl(var(--blueprint-wash))] text-[hsl(var(--primary))] shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
        muted:
          "bg-slate-100 text-slate-700 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
