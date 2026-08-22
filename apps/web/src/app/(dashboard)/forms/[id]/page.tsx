"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Copy,
  Globe,
  ArrowRight,
  BarChart3,
  FileText,
  Check,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FORM_UPDATED_EVENT,
  type FormStatus,
} from "@/lib/forms";
import { useFormMutations, useFormQuery } from "@/features/forms/queries";
import { FormAvailabilitySettings } from "@/features/forms/form-availability-settings";

export default function FormOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;

  const formQuery = useFormQuery(formId);
  const { update } = useFormMutations();

  const updateStatus = async (status: FormStatus) => {
    if (!formQuery.data) return;

    try {
      const response = await update.mutateAsync({ formId: formQuery.data.form.id, status });
      const updatedForm = {
        ...response.form,
        responseCount: formQuery.data.form.responseCount,
      };
      window.dispatchEvent(
        new CustomEvent(FORM_UPDATED_EVENT, { detail: updatedForm }),
      );
      toast.success(
        status === "published" ? "Form published" : "Form status updated",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update the form.",
      );
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!formQuery.data) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/f/${formQuery.data.form.publicId}`,
      );
      setCopied(true);
      toast.success("Link copied to clipboard", {
        description: "Send this URL to your respondents.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy the public link.");
    }
  };

  if (formQuery.isLoading) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading form…</Card>;
  }

  if (!formQuery.data) {
    return <Card className="p-6 text-sm text-muted-foreground">Form not found.</Card>;
  }

  const { form, questions } = formQuery.data;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Left Section: Form Information & Settings ────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form Information */}
        <Card className="p-5 bg-card border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">Form Information</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {form.description || "No description provided."}
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Created</span>
                <span className="text-foreground font-medium">
                  {new Date(form.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Status</span>
                <span className="text-foreground font-medium capitalize">{form.status}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Availability Settings (Desktop position) */}
        <div className="hidden lg:block">
          <FormAvailabilitySettings formId={form.id} />
        </div>
      </div>

      {/* ─── Right Section: Quick Stats, Responses, Actions ────────────────── */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="p-5 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
          <div className="grid gap-2">
            <Button
              size="sm"
              className="flex w-full text-xs font-bold h-11 gap-2 bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] hover:bg-[hsl(var(--mocha-mauve))/0.9] shadow-md transition-all"
              onClick={() => router.push(`/forms/${form.id}/builder`)}
            >
              <span className="sm:hidden">Edit form</span><span className="hidden sm:inline">Open Builder</span> <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Button>

            {/* Share Public Link Input with Copy & Open Controls */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider block">
                Public Form URL
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Input
                    readOnly
                    value={
                      form.status === "published"
                        ? `${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.publicId}`
                        : "Form must be published to share"
                    }
                    className="h-9 text-[11px] font-mono bg-secondary/40 border-border text-foreground pr-2 font-medium select-all"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={form.status !== "published"}
                  className={cn(
                    "h-9 px-3 text-xs font-semibold gap-1.5 transition-all border-border shrink-0 cursor-pointer",
                    copied
                      ? "bg-[hsl(var(--mocha-green))/0.2] border-[hsl(var(--mocha-green))/0.4] text-[hsl(var(--mocha-green))]"
                      : "bg-secondary/40 hover:bg-secondary/80 text-foreground"
                  )}
                  title="Copy link to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[hsl(var(--mocha-green))]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>

                {form.status === "published" && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/f/${form.publicId}`, "_blank")}
                    className="h-9 w-9 border-border bg-secondary/40 hover:bg-secondary/80 text-foreground shrink-0"
                    title="Open public form in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {form.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-9 gap-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => void updateStatus("published")}
              >
                <Globe className="h-3.5 w-3.5" /> Publish Form
              </Button>
            )}
            {form.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-9 gap-2 border-border"
                onClick={() => void updateStatus("closed")}
              >
                Close Form
              </Button>
            )}
            {form.status === "closed" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold h-9 gap-2 border-border"
                onClick={() => void updateStatus("draft")}
              >
                Reopen as Draft
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Statistics */}
        <Card className="p-5 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Form Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Questions</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{questions.length}</span>
            </div>
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Responses</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{form.responseCount ?? 0}</span>
            </div>
            <div className="border border-border/50 bg-muted/10 rounded-lg p-3 text-center col-span-2">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Completion Rate</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">—</span>
            </div>
          </div>
        </Card>

        {/* Recent Responses */}
        <Card className="p-5 bg-card border border-border space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground text-sm">Responses</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => router.push(`/forms/${form.id}/responses`)}
            >
              <FileText className="h-3.5 w-3.5" /> View all
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {form.responseCount === 1
              ? "1 response received."
              : `${form.responseCount ?? 0} responses received.`}
          </p>
        </Card>

        <Card className="p-5 bg-card border border-border space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground text-sm">Analytics</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => router.push(`/forms/${form.id}/analytics`)}
            >
              <BarChart3 className="h-3.5 w-3.5" /> View analytics
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Review response activity and completion trends.
          </p>
        </Card>
      </div>

      {/* ─── Mobile Only: Form Availability Settings at the bottom ──────────── */}
      <div className="lg:hidden">
        <FormAvailabilitySettings formId={form.id} />
      </div>
    </div>
  );
}
