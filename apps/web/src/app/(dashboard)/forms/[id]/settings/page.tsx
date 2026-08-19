"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarClock, Save, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFormMutations, useFormQuery } from "@/features/forms/queries";
import { toast } from "sonner";

function toLocalInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

type AvailabilitySettingsSnapshot = {
  hasStartDate: boolean;
  opensAt: string;
  hasEndDate: boolean;
  expiresAt: string;
  responseLimit: string;
  acceptMultipleResponses: boolean;
};

export default function FormSettingsPage() {
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;
  const { data } = useFormQuery(formId);
  const { update } = useFormMutations();
  const [opensAt, setOpensAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [hasStartDate, setHasStartDate] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [responseLimit, setResponseLimit] = useState("");
  const [acceptMultipleResponses, setAcceptMultipleResponses] = useState(true);
  const [savedSettings, setSavedSettings] = useState<AvailabilitySettingsSnapshot | null>(null);

  const currentSettings: AvailabilitySettingsSnapshot = {
    hasStartDate,
    opensAt: hasStartDate ? opensAt : "",
    hasEndDate,
    expiresAt: hasEndDate ? expiresAt : "",
    responseLimit: responseLimit.trim(),
    acceptMultipleResponses,
  };
  const hasChanges = savedSettings !== null && JSON.stringify(currentSettings) !== JSON.stringify(savedSettings);

  useEffect(() => {
    if (!data?.form) return;
    const snapshot = {
      hasStartDate: Boolean(data.form.opensAt),
      opensAt: toLocalInputValue(data.form.opensAt),
      hasEndDate: Boolean(data.form.expiresAt),
      expiresAt: toLocalInputValue(data.form.expiresAt),
      responseLimit: data.form.responseLimit?.toString() ?? "",
      acceptMultipleResponses: data.form.acceptMultipleResponses,
    };
    setOpensAt(snapshot.opensAt);
    setExpiresAt(snapshot.expiresAt);
    setHasStartDate(snapshot.hasStartDate);
    setHasEndDate(snapshot.hasEndDate);
    setResponseLimit(snapshot.responseLimit);
    setAcceptMultipleResponses(snapshot.acceptMultipleResponses);
    setSavedSettings(snapshot);
  }, [data?.form]);

  const updateStartSchedule = (enabled: boolean) => {
    setHasStartDate(enabled);
    toast.info(enabled ? "Start scheduling enabled" : "Start schedule disabled", {
      description: enabled
        ? "Choose when this form should become available."
        : "The saved start time will be removed when you save.",
    });
  };

  const updateEndSchedule = (enabled: boolean) => {
    setHasEndDate(enabled);
    toast.info(enabled ? "End scheduling enabled" : "End schedule disabled", {
      description: enabled
        ? "Choose when this form should stop accepting responses."
        : "The saved end time will be removed when you save.",
    });
  };

  const updateMultipleResponses = (enabled: boolean) => {
    setAcceptMultipleResponses(enabled);
    toast.info(enabled ? "Multiple responses allowed" : "One response per responder", {
      description: enabled
        ? "Responders can submit this form more than once."
        : "Previous responders will see a response-recorded screen instead of the form.",
    });
  };

  const saveSettings = async () => {
    if (hasStartDate && !opensAt) {
      toast.error("Choose a start date and time.");
      return;
    }
    if (hasEndDate && !expiresAt) {
      toast.error("Choose an end date and time.");
      return;
    }
    const openDate = hasStartDate && opensAt ? new Date(opensAt) : null;
    const closeDate = hasEndDate && expiresAt ? new Date(expiresAt) : null;
    const limit = responseLimit ? Number(responseLimit) : null;

    if ((openDate && Number.isNaN(openDate.getTime())) || (closeDate && Number.isNaN(closeDate.getTime()))) {
      toast.error("Choose valid start and end times.");
      return;
    }
    if (openDate && closeDate && openDate >= closeDate) {
      toast.error("Closing time must be after opening time.");
      return;
    }
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      toast.error("Response limit must be a whole number of at least 1.");
      return;
    }
    if (limit !== null && limit < (data?.form.responseCount ?? 0)) {
      toast.error("Response limit cannot be lower than responses already received.");
      return;
    }

    try {
      await update.mutateAsync({
        formId,
        opensAt: openDate?.toISOString() ?? null,
        expiresAt: closeDate?.toISOString() ?? null,
        responseLimit: limit,
        acceptMultipleResponses,
      });
      toast.success("Availability settings saved", {
        description: "The updated rules apply to the public form immediately.",
      });
      setSavedSettings(currentSettings);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[hsl(var(--mocha-mauve))]">FORM CONTROLS</p>
        <h2 className="mt-1 text-xl font-black tracking-tight">Availability</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose when this form accepts responses and who can submit again.</p>
      </div>

      <Card className="space-y-6 border-border bg-card p-5 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/15 p-4"><div><Label htmlFor="start-date-toggle" className="text-foreground">Schedule a start time</Label><p className="mt-1 text-xs text-muted-foreground">Keep the form unavailable until a specific date and time.</p></div><Switch id="start-date-toggle" checked={hasStartDate} onCheckedChange={updateStartSchedule} /></div>
          {hasStartDate && <div className="space-y-2 rounded-xl border border-[hsl(var(--mocha-mauve))/0.3] bg-[hsl(var(--mocha-mauve))/0.06] p-4"><Label htmlFor="opens-at">Start date and time</Label><Input id="opens-at" type="datetime-local" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} className="bg-secondary/30" /></div>}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/15 p-4"><div><Label htmlFor="end-date-toggle" className="text-foreground">Schedule an end time</Label><p className="mt-1 text-xs text-muted-foreground">Stop accepting responses at a specific date and time.</p></div><Switch id="end-date-toggle" checked={hasEndDate} onCheckedChange={updateEndSchedule} /></div>
          {hasEndDate && <div className="space-y-2 rounded-xl border border-[hsl(var(--mocha-peach))/0.3] bg-[hsl(var(--mocha-peach))/0.06] p-4"><Label htmlFor="expires-at">End date and time</Label><Input id="expires-at" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="bg-secondary/30" /></div>}
        </div>
        <div className="flex gap-3 rounded-xl border border-border bg-secondary/20 p-4"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--mocha-peach))]" /><p className="text-xs leading-5 text-muted-foreground">The API checks these times on every view and submission, so a form closes reliably without a scheduled job.</p></div>
        <div className="space-y-2"><Label htmlFor="response-limit">Maximum responses</Label><Input id="response-limit" type="number" min="1" step="1" inputMode="numeric" value={responseLimit} onChange={(event) => setResponseLimit(event.target.value)} placeholder="Unlimited" className="max-w-xs bg-secondary/30" /><p className="text-xs text-muted-foreground">The form closes when this number of responses is reached.</p></div>
        <div className="flex items-start justify-between gap-6 border-t border-border pt-5"><div className="flex gap-3"><Users className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--mocha-teal))]" /><div><Label htmlFor="multiple-responses" className="text-foreground">Allow multiple responses per responder</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">When off, Blueprint blocks another response from the same hashed IP address.</p></div></div><Switch id="multiple-responses" checked={acceptMultipleResponses} onCheckedChange={updateMultipleResponses} /></div>
      </Card>
      <div className="flex items-center justify-between gap-4"><div className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-[hsl(var(--mocha-green))]" />{hasChanges ? "Unsaved changes" : "Settings are up to date"}</div><Button onClick={saveSettings} disabled={update.isPending || !hasChanges} className="gap-2"><Save className="h-4 w-4" />{update.isPending ? "Saving…" : "Save settings"}</Button></div>
    </div>
  );
}
