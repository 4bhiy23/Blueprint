"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, FileText, Send, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormsQuery } from "@/features/forms/queries";

const CHART = {
  grid: "#45475a",
  label: "#bac2de",
  teal: "#94e2d5",
  tooltip: "#181825",
};

export default function AnalyticsPage() {
  const { data, isLoading } = useFormsQuery();
  const forms = data?.forms ?? [];
  const totalResponses = forms.reduce((total, form) => total + (form.responseCount ?? 0), 0);
  const publishedForms = forms.filter((form) => form.status === "published").length;
  const chartData = [...forms]
    .sort((left, right) => (right.responseCount ?? 0) - (left.responseCount ?? 0))
    .slice(0, 6)
    .map((form) => ({ name: form.title || "Untitled form", responses: form.responseCount ?? 0 }));

  if (isLoading) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">A live read of the response activity across your forms.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard detail="Forms in your workspace" icon={FileText} label="Forms" value={forms.length} tone="mauve" />
        <MetricCard detail="Currently open or scheduled" icon={Send} label="Published" value={publishedForms} tone="teal" />
        <MetricCard detail="Across all of your forms" icon={Users} label="Responses" value={totalResponses} tone="mauve" />
      </div>

      <Card className="overflow-hidden border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(var(--mocha-teal))/0.14]">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--mocha-teal))]" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Responses by form</h2>
            <p className="text-xs text-muted-foreground">Your six most active forms</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-80 px-3 pb-4 pt-5 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 28, left: 16, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke={CHART.grid} strokeDasharray="3 5" />
                <XAxis allowDecimals={false} axisLine={false} tick={{ fill: CHART.label, fontSize: 11 }} tickLine={false} type="number" />
                <YAxis axisLine={false} dataKey="name" tick={{ fill: CHART.label, fontSize: 11 }} tickFormatter={(name) => String(name).slice(0, 24)} tickLine={false} type="category" width={130} />
                <Tooltip
                  contentStyle={{ background: CHART.tooltip, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
                  cursor={{ fill: "rgba(69, 71, 90, 0.35)" }}
                  formatter={(value) => [`${value ?? 0} responses`, "Submissions"]}
                  labelStyle={{ color: "#cdd6f4" }}
                  itemStyle={{ color: CHART.teal }}
                />
                <Bar dataKey="responses" fill={CHART.teal} maxBarSize={28} name="Responses" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="font-medium text-foreground">No forms to compare yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create and publish a form to see its response activity here.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  detail: string;
  tone: "mauve" | "teal";
}) {
  const color = tone === "mauve" ? "text-[hsl(var(--mocha-mauve))]" : "text-[hsl(var(--mocha-teal))]";

  return (
    <Card className="border border-border bg-card p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}
