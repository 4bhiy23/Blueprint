import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-[hsl(var(--mocha-green))/0.15] text-[hsl(var(--mocha-green))] border-[hsl(var(--mocha-green))/0.3]",
        warning:
          "border-transparent bg-[hsl(var(--mocha-peach))/0.15] text-[hsl(var(--mocha-peach))] border-[hsl(var(--mocha-peach))/0.3]",
        info:
          "border-transparent bg-[hsl(var(--mocha-sapphire))/0.15] text-[hsl(var(--mocha-sapphire))] border-[hsl(var(--mocha-sapphire))/0.3]",
        muted:
          "border border-border bg-secondary text-muted-foreground",
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
