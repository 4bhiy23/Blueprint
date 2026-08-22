"use client";

import { useEffect, useState } from "react";

import { MobileFormBuilder } from "./MobileFormBuilder";

export function MobileBuilderGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return <MobileFormBuilder />;
  }

  return <>{children}</>;
}
