"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  BarChart2, 
  Eye, 
  Inbox, 
  Download,
  Loader2,
  Search, 
  UserCheck 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  useFormResponsesQuery, 
  useFormQuery 
} from "@/features/forms/queries";
import { formsApi } from "@/features/forms/api";
import { toast } from "sonner";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;

  // Data queries
  const { data: responsesData, isLoading: loadingResponses } = useFormResponsesQuery(formId);
  const { data: formDetails, isLoading: loadingForm } = useFormQuery(formId);

  // View switch: "default" (original submissions table) vs "questions" (per-question carousel)
  const [activeTab, setActiveTab] = useState<"default" | "questions">("default");
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Question Carousel state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Filtered and sorted responder rows for default table
  const responsesList = useMemo(() => {
    if (!responsesData) return [];
    const query = search.trim().toLowerCase();

    return responsesData.responses
      .filter((response) => response.id.toLowerCase().includes(query))
      .sort((left, right) => {
        const difference = new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime();
        return -difference;
      });
  }, [responsesData, search]);

  const isLoading = loadingResponses || loadingForm;

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await formsApi.downloadResponsesCsv(formId);
      toast.success("CSV export downloaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export responses.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!responsesData || !formDetails) return null;

  const totalSubmissions = responsesData.responses.length;
  const questionsList = formDetails.questions;
  const currentQuestion = questionsList[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* ─── Header & Top Control Bar ────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 border border-border rounded-2xl p-4 shadow-lg">
        {/* Navigation Mode Switcher */}
        <div className="grid w-full grid-cols-2 gap-1 rounded-xl border border-border/80 bg-secondary/50 p-1 sm:flex sm:w-auto sm:gap-0 sm:shrink-0">
          <button
            onClick={() => setActiveTab("default")}
            className={cn(
              "flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold leading-4 transition-all cursor-pointer sm:px-3.5 sm:py-1.5",
              activeTab === "default"
                ? "bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="sm:hidden">Submissions ({totalSubmissions})</span><span className="hidden sm:inline">Default Submissions ({totalSubmissions})</span>
          </button>
          
          <button
            onClick={() => setActiveTab("questions")}
            className={cn(
              "flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold leading-4 transition-all cursor-pointer sm:px-3.5 sm:py-1.5",
              activeTab === "questions"
                ? "bg-[hsl(var(--mocha-mauve))] text-[hsl(var(--mocha-crust))] shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart2 className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="sm:hidden">Questions ({questionsList.length})</span><span className="hidden sm:inline">Question Carousel ({questionsList.length})</span>
          </button>
        </div>

        {/* Search for Default Table */}
        {activeTab === "default" && (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search response ID..."
                aria-label="Search responses by response ID"
                className="h-8.5 pl-8 text-xs bg-secondary/30 border-border focus-visible:ring-1 focus-visible:ring-[hsl(var(--mocha-mauve))]"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting || totalSubmissions === 0}
              className="h-8.5 shrink-0 gap-1.5 border-border bg-secondary/30 text-xs font-bold hover:bg-[hsl(var(--mocha-mauve))] hover:text-[hsl(var(--mocha-crust))]"
            >
              {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* ─── 1. DEFAULT RESPONSES TABLE VIEW (Original Full Page Navigation) ──── */}
      {activeTab === "default" && (
        <>
          {responsesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/20 p-12 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground mb-4">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No responses found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                {search
                  ? "No submission ID matches your search criteria."
                  : "Responses will appear here as soon as users submit the public form."}
              </p>
            </div>
          ) : (
            <Card className="overflow-hidden border border-border bg-card shadow-lg rounded-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Response ID
                    </TableHead>
                    <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Submitted At
                    </TableHead>
                    <TableHead className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Completion Time
                    </TableHead>
                    <TableHead className="text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responsesList.map((response, index) => (
                    <TableRow 
                      key={response.id}
                      className="transition-colors hover:bg-secondary/30"
                    >
                      <TableCell className="text-xs font-mono font-bold text-foreground">
                        Response #{totalSubmissions - index}
                        <span className="text-[10px] font-normal text-muted-foreground/60 block truncate max-w-[140px]">
                          {response.id}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(response.submittedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>

                      <TableCell className="text-xs font-mono">
                        {response.completionMs === null ? (
                          <span className="text-muted-foreground/60">—</span>
                        ) : (
                          <Badge variant="muted" className="font-mono text-[10px]">
                            {Math.round(response.completionMs / 1000)}s
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-bold gap-1.5 border-border bg-secondary/30 hover:bg-[hsl(var(--mocha-mauve))] hover:text-[hsl(var(--mocha-crust))] transition-all cursor-pointer"
                          onClick={() => router.push(`/forms/${formId}/responses/${response.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* ─── 2. PER-QUESTION CAROUSEL VIEW (Inline Question Answers) ─────────── */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {questionsList.length === 0 ? (
            <Card className="p-8 text-center border border-dashed border-border bg-card/20">
              <p className="text-xs text-muted-foreground">No questions found in this form.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden space-y-5 rounded-2xl border border-border bg-card p-4 shadow-xl sm:space-y-6 sm:p-6">
              {/* Question Navigation Bar with Left & Right Arrows */}
              <div className="grid grid-cols-2 gap-2 border-b border-border pb-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="h-10 min-w-0 gap-1.5 border-border px-2 text-xs font-bold cursor-pointer sm:h-9 sm:shrink-0 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" /><span className="sm:hidden">Previous</span><span className="hidden sm:inline">Prev Question</span>
                </Button>

                {/* Center Question Title & Counter */}
                <div className="col-span-2 order-first min-w-0 text-center sm:order-none">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[hsl(var(--mocha-mauve))] bg-[hsl(var(--mocha-mauve))/0.15] px-2.5 py-0.5 rounded-sm border border-[hsl(var(--mocha-mauve))/0.3]">
                      QUESTION {currentQuestionIndex + 1} OF {questionsList.length}
                    </span>
                    {currentQuestion.required && (
                      <span className="text-[10px] font-mono text-[hsl(var(--mocha-red))] font-bold">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-foreground mt-1.5 truncate">
                    {currentQuestion.title}
                  </h3>
                  {currentQuestion.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md mx-auto">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuestionIndex === questionsList.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="h-10 min-w-0 gap-1.5 border-border px-2 text-xs font-bold cursor-pointer sm:h-9 sm:shrink-0 sm:px-3"
                >
                  <span className="sm:hidden">Next</span><span className="hidden sm:inline">Next Question</span><ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>

              {/* Answers List for Current Question Across All Responders */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col gap-2 text-xs font-mono font-bold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span className="uppercase tracking-wider">
                    Answers for Question #{currentQuestionIndex + 1}
                  </span>
                  <Badge variant="muted" className="text-[10px] font-mono">
                    {totalSubmissions} Total Submissions
                  </Badge>
                </div>

                {totalSubmissions === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                    <p className="text-xs text-muted-foreground">No answers recorded yet for this question.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {responsesData.responses.map((resp, rIdx) => {
                      const userAns = resp.answers?.find((a) => a.questionId === currentQuestion.id)?.answer;
                      return (
                        <div
                          key={resp.id}
                          className="p-4 rounded-xl bg-secondary/25 border border-border/80 space-y-2 hover:border-border transition-all"
                        >
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-[hsl(var(--mocha-mauve))]">
                                RESPONDER #{totalSubmissions - rIdx}
                              </span>
                              <span className="min-w-0 truncate text-[10px] font-mono text-muted-foreground/60">
                                (ID: {resp.id})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground sm:shrink-0">
                              {new Date(resp.submittedAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>

                          {/* Display the actual answer given by the user */}
                          <div className="p-3 rounded-lg bg-card border border-border/60 text-xs font-semibold text-foreground">
                            {userAns ? (
                              <span className="text-[hsl(var(--mocha-teal))] font-mono font-bold">{userAns}</span>
                            ) : (
                              <span className="text-muted-foreground/60 italic">No response provided</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
