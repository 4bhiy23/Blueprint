"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FORM_UPDATED_EVENT,
  type FormRecord,
} from "@/lib/forms";
import { useFormQuery } from "@/features/forms/queries";

export default function FormDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const { data: formDetails } = useFormQuery(formId);
  const [updatedForm, setUpdatedForm] = useState<FormRecord | null>(null);
  const form = updatedForm ?? formDetails?.form ?? null;

  useEffect(() => {
    const handleFormUpdated = (event: Event) => {
      const updatedForm = (event as CustomEvent<FormRecord>).detail;

      if (updatedForm?.id === formId) {
        setUpdatedForm(updatedForm);
      }
    };

    window.addEventListener(FORM_UPDATED_EVENT, handleFormUpdated);
    return () => window.removeEventListener(FORM_UPDATED_EVENT, handleFormUpdated);
  }, [formId]);

  // If the path is exactly "/forms/[id]/builder", render it full-screen without side navigation
  const isBuilderRoute = pathname.endsWith("/builder");
  if (isBuilderRoute) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
         PAGE HEADER (Breadcrumbs, Title, Badge)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Breadcrumb: Forms / Current Form */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Link href="/dashboard" className="hover:text-[hsl(var(--mocha-mauve))] transition-colors font-medium">
            Forms
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-50">
            {form?.title ?? "Loading form…"}
          </span>
        </div>

        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground truncate max-w-md sm:max-w-xl">
              {form?.title ?? "Loading form…"}
            </h1>
            <Badge
              variant={
                form?.status === "published"
                  ? "success"
                  : form?.status === "closed"
                  ? "destructive"
                  : "muted"
              }
              className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5"
            >
              {form?.status ?? "loading"}
            </Badge>
          </div>

        </div>
      </div>

      <Separator />

      <main className="w-full min-w-0">{children}</main>
    </div>
  );
}
