import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-2 border-[hsl(var(--foreground))] doodle-border-sm shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:bg-[hsl(var(--blueprint-blue-light))] hover:shadow-[4px_5px_0px_0px_hsl(var(--foreground))]",
        destructive:
          "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] border-2 border-[hsl(var(--foreground))] doodle-border-sm shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_5px_0px_0px_hsl(var(--foreground))]",
        outline:
          "border-2 border-[hsl(var(--foreground))] bg-white text-[hsl(var(--foreground))] doodle-border-sm shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:bg-[hsl(var(--blueprint-wash))] hover:text-[hsl(var(--primary))] hover:shadow-[4px_5px_0px_0px_hsl(var(--foreground))]",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border-2 border-[hsl(var(--foreground))] doodle-border-sm shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:bg-white",
        ghost:
          "hover:bg-[hsl(var(--blueprint-wash))] hover:text-[hsl(var(--primary))] rounded-lg border-2 border-transparent hover:border-[hsl(var(--foreground))]",
        link:
          "text-[hsl(var(--primary))] font-bold underline decoration-2 underline-offset-4 hover:opacity-80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-7 text-base font-extrabold",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
