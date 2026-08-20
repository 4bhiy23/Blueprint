"use client";

import { useParams } from "next/navigation";
import { BarChart3, Clock3, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormAnalyticsQuery } from "@/features/forms/queries";

const CHART = {
  grid: "#45475a",
  label: "#bac2de",
  mauve: "#cba6f7",
  teal: "#94e2d5",
  tooltip: "#181825",
};

function formatDuration(milliseconds: number | null) {
  if (milliseconds === null) return "—";

  const seconds = Math.round(milliseconds / 1_000);
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

function formatDate(date: string, compact = false) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: compact ? "numeric" : "short",
    day: "numeric",
  });
}

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = (params?.formId || params?.id) as string;
  const { data: analytics, isLoading } = useFormAnalyticsQuery(formId);

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (!analytics) return null;

  const hasResponses = analytics.responsesByDay.some((day) => day.count > 0);

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
            <Users className="h-4 w-4 text-[hsl(var(--mocha-mauve))]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{analytics.totalResponses}</p>
          <p className="mt-1 text-xs text-muted-foreground">All-time completed responses</p>
        </Card>

        <Card className="border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Average completion time</span>
            <Clock3 className="h-4 w-4 text-[hsl(var(--mocha-teal))]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatDuration(analytics.averageCompletionMs)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Based on responses with timing data</p>
        </Card>
      </div>

      <Card className="overflow-hidden border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--mocha-mauve))/0.14]">
              <BarChart3 className="h-4 w-4 text-[hsl(var(--mocha-mauve))]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Response pulse</h3>
              <p className="text-xs text-muted-foreground">Daily submissions over the last 14 days</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-[hsl(var(--mocha-teal))/0.25] bg-[hsl(var(--mocha-teal))/0.1] px-2.5 py-1 text-xs font-medium text-[hsl(var(--mocha-teal))]">
            {analytics.totalResponses} total
          </span>
        </div>

        <div className="h-72 px-3 pb-3 pt-5 sm:px-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.responsesByDay} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="response-pulse" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={CHART.mauve} stopOpacity={0.42} />
                  <stop offset="100%" stopColor={CHART.mauve} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="3 5" />
              <XAxis axisLine={false} dataKey="date" minTickGap={24} tick={{ fill: CHART.label, fontSize: 11 }} tickFormatter={(date) => formatDate(date, true)} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tick={{ fill: CHART.label, fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: CHART.tooltip, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
                cursor={{ stroke: CHART.teal, strokeDasharray: "3 3" }}
                formatter={(value) => [`${value ?? 0} submissions`, "Responses"]}
                labelFormatter={(date) => formatDate(String(date))}
                labelStyle={{ color: "#cdd6f4" }}
                itemStyle={{ color: CHART.mauve }}
              />
              <Area activeDot={{ fill: CHART.teal, r: 5, stroke: CHART.tooltip, strokeWidth: 2 }} dataKey="count" fill="url(#response-pulse)" fillOpacity={1} name="Responses" stroke={CHART.mauve} strokeWidth={2.5} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {!hasResponses && (
          <p className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            The chart will begin to trace activity after the first response arrives.
          </p>
        )}
      </Card>
    </div>
  );
}
