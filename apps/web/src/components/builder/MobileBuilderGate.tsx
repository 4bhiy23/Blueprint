"use client";

import { MonitorSmartphone } from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

export function MobileBuilderGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6">
        <Card className="max-w-sm space-y-3 p-6 text-center">
          <MonitorSmartphone aria-hidden="true" className="mx-auto h-8 w-8 text-[hsl(var(--primary))]" />
          <h1 className="text-lg font-black">Builder is available on desktop</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Use a screen at least 768px wide to edit this form.
          </p>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
