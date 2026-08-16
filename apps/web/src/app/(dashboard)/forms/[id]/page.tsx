"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Copy,
  Globe,
  ArrowRight,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  FORM_UPDATED_EVENT,
  type FormStatus,
} from "@/lib/forms";
import { useFormMutations, useFormQuery } from "@/features/forms/queries";

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

  const handleCopyLink = async () => {
    if (!formQuery.data) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/f/${formQuery.data.form.publicId}`,
      );
      toast.success("Link copied to clipboard", {
        description: "Send this URL to your respondents.",
      });
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
      {/* ─── Left Section: Form Information & Visual Preview ──────────────── */}
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

        {/* Visual Flow Preview (Read Only) */}
        <Card className="bg-card border border-border overflow-hidden flex flex-col min-h-[340px]">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Builder Preview</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Available after builder API integration</p>
            </div>
            <Badge variant="muted" className="text-[10px]">Coming soon</Badge>
          </div>
          <div className="flex flex-1 items-center justify-center bg-background p-6 text-center" style={{ minHeight: "260px" }}>
            <p className="max-w-sm text-xs text-muted-foreground">
              The saved question flow will appear here once the builder is connected to the API.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Right Section: Quick Stats, Responses, Actions ────────────────── */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card className="p-5 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
          <div className="grid gap-2">
            <Button
              size="sm"
              className="w-full text-xs font-semibold h-8.5 gap-2"
              onClick={() => router.push(`/forms/${form.id}/builder`)}
            >
              Open Builder <ArrowRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-8.5 gap-2 border-border"
              onClick={handleCopyLink}
              disabled={form.status !== "published"}
            >
              <Copy className="h-3.5 w-3.5" /> Copy Public Link
            </Button>
            {form.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8.5 gap-2 border-primary/20 text-primary hover:bg-primary/5"
                onClick={() => void updateStatus("published")}
              >
                <Globe className="h-3.5 w-3.5" /> Publish Form
              </Button>
            )}
            {form.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8.5 gap-2 border-border"
                onClick={() => void updateStatus("closed")}
              >
                Close Form
              </Button>
            )}
            {form.status === "closed" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8.5 gap-2 border-border"
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
      </div>
    </div>
  );
}
