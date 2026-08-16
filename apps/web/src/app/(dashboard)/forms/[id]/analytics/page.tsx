"use client";

import { useParams } from "next/navigation";
import { BarChart3, Clock3, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormAnalyticsQuery } from "@/features/forms/queries";

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "—";

  const seconds = Math.round(milliseconds / 1_000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;
  const { data: analytics, isLoading } = useFormAnalyticsQuery(formId);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!analytics) {
    return null;
  }

  const peakDailyResponses = Math.max(...analytics.responsesByDay.map((day) => day.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Submission activity for {analytics.form.title}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Submissions</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{analytics.totalResponses}</p>
          <p className="mt-1 text-xs text-muted-foreground">All-time completed responses</p>
        </Card>

        <Card className="border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Average completion time</span>
            <Clock3 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatDuration(analytics.averageCompletionMs)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Based on responses with timing data</p>
        </Card>
      </div>

      <Card className="space-y-4 border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Response volume</h3>
            <p className="text-xs text-muted-foreground">Daily submissions over the last 14 days</p>
          </div>
        </div>

        <div className="flex h-56 items-end gap-2 border-b border-border pt-6">
          {analytics.responsesByDay.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                aria-label={`${day.count} submissions on ${day.date}`}
                className="w-full rounded-t-sm bg-primary/30 transition-colors hover:bg-primary/50"
                style={{ height: `${Math.max((day.count / peakDailyResponses) * 100, day.count ? 4 : 0)}%` }}
                title={`${day.count} submissions`}
              />
              <span className="text-[9px] text-muted-foreground">
                {new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
