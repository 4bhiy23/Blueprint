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
  Download,
  ExternalLink,
  Loader2,
  QrCode,
} from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGeneratingQrCode, setIsGeneratingQrCode] = useState(false);
  const currentForm = formQuery.data?.form;
  const publicFormUrl =
    typeof window !== "undefined" && currentForm
      ? `${window.location.origin}/f/${currentForm.publicId}`
      : "";

  useEffect(() => {
    if (
      !isQrDialogOpen ||
      currentForm?.status !== "published" ||
      !publicFormUrl
    ) {
      return;
    }

    let isCurrent = true;
    setIsGeneratingQrCode(true);
    setQrCodeDataUrl(null);

    void QRCode.toDataURL(publicFormUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        if (isCurrent) setQrCodeDataUrl(dataUrl);
      })
      .catch(() => {
        if (isCurrent) toast.error("Unable to generate the QR code.");
      })
      .finally(() => {
        if (isCurrent) setIsGeneratingQrCode(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentForm?.publicId, currentForm?.status, isQrDialogOpen, publicFormUrl]);

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

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl || !currentForm) return;

    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `blueprint-${currentForm.publicId}-qr.png`;
    link.click();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* ─── Left Section: Form Information & Settings ────────────────────── */}
      <div className="space-y-4 lg:col-span-2">
        {/* Form Information */}
        <Card className="border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Form Information</h3>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            {form.description || "No description provided."}
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
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
      <div className="space-y-4">
        {/* Quick Actions */}
        <Card className="space-y-3 border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground text-sm">Quick Actions</h3>
          <div className="grid gap-2">
            <Button
              size="sm"
              className="flex h-9 w-full gap-2 bg-[hsl(var(--mocha-mauve))] text-xs font-bold text-[hsl(var(--mocha-crust))] shadow-md transition-all hover:bg-[hsl(var(--mocha-mauve))/0.9]"
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
                        ? publicFormUrl
                        : "Form must be published to share"
                    }
                  className="h-8 border-border bg-secondary/40 pr-2 font-mono text-[11px] font-medium text-foreground select-all"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={form.status !== "published"}
                  className={cn(
                    "h-8 shrink-0 cursor-pointer gap-1.5 border-border px-3 text-xs font-semibold transition-all",
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

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsQrDialogOpen(true)}
                  disabled={form.status !== "published"}
                  className="h-8 w-8 shrink-0 border-border bg-secondary/40 text-foreground hover:bg-secondary/80"
                  aria-label="Show QR code"
                  title="Show QR code"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </Button>

                {form.status === "published" && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/f/${form.publicId}`, "_blank")}
                    className="h-8 w-8 shrink-0 border-border bg-secondary/40 text-foreground hover:bg-secondary/80"
                    title="Open public form in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Share with QR code</DialogTitle>
                  <DialogDescription>
                    Scan this code to open the public form.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex min-h-64 items-center justify-center rounded-lg border border-border bg-white p-4">
                  {isGeneratingQrCode && (
                    <Loader2
                      className="h-6 w-6 animate-spin text-primary"
                      aria-label="Generating QR code"
                    />
                  )}
                  {!isGeneratingQrCode && qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR code for ${form.title}`}
                      className="h-56 w-56 max-w-full object-contain"
                    />
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleDownloadQrCode}
                    disabled={!qrCodeDataUrl || isGeneratingQrCode}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download QR code
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {form.status === "draft" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-2 border-primary bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => void updateStatus("published")}
              >
                <Globe className="h-3.5 w-3.5" /> Publish Form
              </Button>
            )}
            {form.status === "published" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-2 border-border text-xs font-semibold"
                onClick={() => void updateStatus("closed")}
              >
                Close Form
              </Button>
            )}
            {form.status === "closed" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-2 border-border text-xs font-semibold"
                onClick={() => void updateStatus("draft")}
              >
                Reopen as Draft
              </Button>
            )}
          </div>
        </Card>

        {/* Quick Statistics */}
        <Card className="space-y-3 border border-border bg-card p-4">
          <h3 className="font-semibold text-foreground text-sm">Form Stats</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/50 bg-muted/10 p-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Questions</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{questions.length}</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/10 p-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Responses</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">{form.responseCount ?? 0}</span>
            </div>
            <div className="col-span-2 rounded-lg border border-border/50 bg-muted/10 p-2 text-center">
              <span className="text-[10px] text-muted-foreground uppercase block font-medium">Completion Rate</span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">—</span>
            </div>
          </div>
        </Card>

        {/* Recent Responses */}
        <Card className="space-y-2.5 border border-border bg-card p-4">
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

        <Card className="space-y-2.5 border border-border bg-card p-4">
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
