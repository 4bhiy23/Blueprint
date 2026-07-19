"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, Eye, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  // Simple gorgeous SaaS analytics mockup
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Track response rates, submission trends, and form views.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Views</span>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">12,482</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +14.2% from last week
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submissions</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">4,892</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8.3% from last week
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversion Rate</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">39.2%</p>
            <p className="text-xs text-muted-foreground mt-1">Average response time: 1m 24s</p>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</span>
            <HelpCircle className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-foreground">94.8%</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +1.2% from last week
            </p>
          </div>
        </Card>
      </div>

      {/* Mock chart view */}
      <Card className="p-6 bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Response Volume</h3>
            <p className="text-xs text-muted-foreground">Daily submission count over the last 14 days</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">14d</Badge>
            <Badge variant="outline">30d</Badge>
            <Badge variant="outline">90d</Badge>
          </div>
        </div>

        <div className="h-64 flex items-end gap-2 pt-6 border-b border-border">
          {[40, 55, 45, 60, 80, 65, 70, 95, 110, 85, 90, 120, 130, 105].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-primary/20 hover:bg-primary/45 transition-colors rounded-t-sm relative group"
                style={{ height: `${(val / 150) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-[10px] text-foreground rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                  {val} submissions
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground/60">07/{10 + idx}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
