"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import type { FormResponseDetails } from "@/lib/forms";
import { toast } from "sonner";

export default function IndividualResponsePage() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;
  const responseId = params?.responseId as string;
  const [data, setData] = useState<FormResponseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId || !responseId) return;
    void apiFetch<FormResponseDetails>(`/forms/${formId}/responses/${responseId}`)
      .then(setData)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load response."))
      .finally(() => setLoading(false));
  }, [formId, responseId]);

  if (loading) return <Skeleton className="h-80 w-full" />;
  if (!data) return <Button variant="outline" onClick={() => router.push(`/forms/${formId}/responses`)}><ArrowLeft /> Back to responses</Button>;

  return <div className="space-y-6"><Link href={`/forms/${formId}/responses`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Responses</Link><Card className="space-y-2 border border-border bg-card p-5"><h2 className="text-lg font-bold text-foreground">Submission</h2><div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(data.response.submittedAt).toLocaleString()}</span><span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{data.response.completionMs === null ? "Completion time unavailable" : `${Math.round(data.response.completionMs / 1000)}s completion time`}</span></div></Card><div className="space-y-4"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Answers</h3>{data.response.answers.map((answer, index) => <Card key={answer.questionId} className="space-y-2 border border-border bg-card p-5"><p className="text-xs font-semibold text-muted-foreground">Question {index + 1}</p><p className="text-sm font-semibold text-foreground">{answer.question}</p><Separator /><p className={answer.answer === null ? "text-xs italic text-muted-foreground" : "whitespace-pre-wrap text-xs text-foreground/90"}>{answer.answer ?? "No answer provided"}</p></Card>)}</div></div>;
}
