import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse border-2 border-[hsl(var(--foreground))/0.3] bg-[hsl(var(--blueprint-wash))] doodle-border-sm shadow-[2px_2px_0px_0px_hsl(var(--foreground))/0.2]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
