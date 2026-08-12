"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpDown, Eye, Inbox, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { FormResponses } from "@/lib/forms";
import { toast } from "sonner";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;
  const [data, setData] = useState<FormResponses | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortAscending, setSortAscending] = useState(false);

  useEffect(() => {
    if (!formId) return;
    void apiFetch<FormResponses>(`/forms/${formId}/responses`)
      .then(setData)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load responses."))
      .finally(() => setLoading(false));
  }, [formId]);

  const responses = useMemo(() => {
    if (!data) return [];
    return data.responses
      .filter((response) => response.id.toLowerCase().includes(search.toLowerCase()))
      .sort((left, right) => {
        const difference = new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime();
        return sortAscending ? difference : -difference;
      });
  }, [data, search, sortAscending]);

  if (loading) return <Skeleton className="h-80 w-full" />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Responses</h2>
          <p className="text-sm text-muted-foreground">{data.responses.length} completed submissions</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by response ID..." className="h-8 pl-8 text-xs" />
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/10 p-12 text-center">
          <Inbox className="mb-4 h-6 w-6 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">No responses found</h3>
          <p className="mt-1 text-xs text-muted-foreground">{search ? "No response ID matches your search." : "Responses will appear here after people submit the form."}</p>
        </div>
      ) : (
        <Card className="overflow-hidden border border-border bg-card">
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Response</TableHead><TableHead><button onClick={() => setSortAscending((value) => !value)} className="flex items-center gap-1">Submitted <ArrowUpDown className="h-3 w-3" /></button></TableHead><TableHead>Completion time</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{responses.map((response, index) => <TableRow key={response.id}><TableCell className="text-xs font-medium">Response #{data.responses.length - index}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(response.submittedAt).toLocaleString()}</TableCell><TableCell className="text-xs text-muted-foreground">{response.completionMs === null ? "—" : `${Math.round(response.completionMs / 1000)}s`}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => router.push(`/forms/${formId}/responses/${response.id}`)}><Eye className="h-3.5 w-3.5" /> View</Button></TableCell></TableRow>)}</TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
