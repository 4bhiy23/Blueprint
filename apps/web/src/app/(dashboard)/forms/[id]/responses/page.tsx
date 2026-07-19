"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Inbox,
  ArrowUpDown,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ResponseData {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  status: "completed" | "in-progress";
}

const MOCK_RESPONSES: ResponseData[] = [
  {
    id: "resp_1",
    name: "Alex Rivera",
    email: "alex@example.com",
    submittedAt: "2026-07-19T20:15:00Z",
    status: "completed",
  },
  {
    id: "resp_2",
    name: "Sarah Chen",
    email: "sarah.c@example.com",
    submittedAt: "2026-07-19T18:40:00Z",
    status: "completed",
  },
  {
    id: "resp_3",
    name: "Marcus Johnson",
    email: "marcus@example.com",
    submittedAt: "2026-07-19T15:22:00Z",
    status: "completed",
  },
  {
    id: "resp_4",
    name: "Emily Taylor",
    email: "emily.t@example.com",
    submittedAt: "2026-07-18T11:05:00Z",
    status: "completed",
  },
  {
    id: "resp_5",
    name: "David Kim",
    email: "d.kim@example.com",
    submittedAt: "2026-07-17T09:15:00Z",
    status: "in-progress",
  },
];

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRowClick = (responseId: string) => {
    router.push(`/forms/${formId}/responses/${responseId}`);
  };

  const handlePreview = () => {
    toast.info("Opening form preview...");
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredResponses = MOCK_RESPONSES.filter(
    (resp) =>
      resp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedResponses = [...filteredResponses].sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime();
    const dateB = new Date(b.submittedAt).getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Responses</h2>
          <Badge variant="muted" className="h-5 px-1.5 text-[10px] font-semibold">
            {MOCK_RESPONSES.length} Total
          </Badge>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/20 border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button
            onClick={handlePreview}
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-border shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Preview Form
          </Button>
        </div>
      </div>

      {/* Main Table area */}
      {loading ? (
        <Card className="border border-border/60 bg-card overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : sortedResponses.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-xl p-12 text-center bg-card/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground/80 mb-4">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">No responses found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery
              ? "No respondents match your search terms. Try search for a name or email."
              : "Responses will appear here once users start submitting this form."}
          </p>
        </div>
      ) : (
        <Card className="border border-border/60 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">Respondent</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Email</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  <button
                    onClick={toggleSort}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                  >
                    Submitted At
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResponses.map((resp) => (
                <TableRow
                  key={resp.id}
                  onClick={() => handleRowClick(resp.id)}
                  className="cursor-pointer group hover:bg-accent/40 transition-colors"
                >
                  <TableCell className="text-xs font-medium text-foreground">{resp.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{resp.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(resp.submittedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={resp.status === "completed" ? "success" : "muted"}
                      className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0"
                    >
                      {resp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(resp.id);
                      }}
                      className="h-7 text-[10px] px-2.5 gap-1 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Response
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
