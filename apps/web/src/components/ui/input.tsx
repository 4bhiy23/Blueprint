import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-[hsl(var(--foreground))] bg-white px-3 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] shadow-[2px_2.5px_0px_0px_hsl(var(--foreground))] transition-all placeholder:text-slate-400 focus-visible:outline-hidden focus-visible:border-[hsl(var(--primary))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))/0.3] focus-visible:shadow-[3px_4px_0px_0px_hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
