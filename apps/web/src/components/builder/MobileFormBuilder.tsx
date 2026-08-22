"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { type BuilderData } from "@/features/forms/api";
import { useBuilderQuery, useFormMutations, useFormQuery } from "@/features/forms/queries";
import {
  QUESTION_OPTION_TYPES,
  QUESTION_TYPE_META,
  QUESTION_TYPES,
  generateId,
  type QuestionOption,
  type QuestionType,
} from "./types";

type MobileQuestion = BuilderData["nodes"][number];

function usesOptions(type: QuestionType) {
  return QUESTION_OPTION_TYPES.includes(type as (typeof QUESTION_OPTION_TYPES)[number]);
}

function makeLinearBuilder(nodes: MobileQuestion[], viewport: BuilderData["viewport"]): BuilderData {
  const positionedNodes = nodes.map((node, index) => ({
    ...node,
    position: { x: 80, y: 80 + index * 170 },
  }));

  return {
    nodes: positionedNodes,
    edges: positionedNodes.slice(1).map((node, index) => ({
      source: positionedNodes[index].id,
      target: node.id,
    })),
    viewport,
  };
}

function newQuestion(type: QuestionType): MobileQuestion {
  return {
    id: generateId(),
    type,
    position: { x: 80, y: 80 },
    data: {
      title: "Untitled question",
      description: "",
      required: false,
      options: usesOptions(type) ? [{ id: generateId(), label: "Option 1" }] : [],
      ratingMax: 5,
      ratingLowLabel: "",
      ratingHighLabel: "",
    },
  };
}

function duplicateQuestion(question: MobileQuestion): MobileQuestion {
  return {
    ...question,
    id: generateId(),
    data: {
      ...question.data,
      title: `${question.data.title} (copy)`,
      options: question.data.options.map((option) => ({ ...option, id: generateId() })),
    },
  };
}

export function MobileFormBuilder() {
  const params = useParams();
  const router = useRouter();
  const formId = (params?.formId || params?.id) as string;
  const formQuery = useFormQuery(formId);
  const builderQuery = useBuilderQuery(formId);
  const { saveBuilder } = useFormMutations();
  const [builder, setBuilder] = useState<BuilderData | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const hydratedRef = useRef(false);

  const isReadOnly = formQuery.data?.form.status === "published";
  const selectedQuestion = builder?.nodes.find((question) => question.id === selectedQuestionId) ?? null;

  useEffect(() => {
    if (!builderQuery.data || hydratedRef.current) return;
    hydratedRef.current = true;
    setBuilder(builderQuery.data);
  }, [builderQuery.data]);

  const save = useDebouncedCallback(async (nextBuilder: BuilderData) => {
    try {
      await saveBuilder.mutateAsync({ formId, builder: nextBuilder });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      toast.error("Changes could not be saved. Check your connection and try again.");
    }
  }, 800);

  const updateBuilder = useCallback((update: (current: BuilderData) => BuilderData) => {
    if (isReadOnly) {
      toast.error("Close responses before editing this published form.");
      return;
    }

    setBuilder((current) => {
      if (!current) return current;
      const next = update(current);
      setSaveStatus("saving");
      save(next);
      return next;
    });
  }, [isReadOnly, save]);

  const updateQuestion = (questionId: string, update: (question: MobileQuestion) => MobileQuestion) => {
    updateBuilder((current) => makeLinearBuilder(
      current.nodes.map((question) => question.id === questionId ? update(question) : question),
      current.viewport,
    ));
  };

  const moveQuestion = (questionId: string, direction: -1 | 1) => {
    updateBuilder((current) => {
      const index = current.nodes.findIndex((question) => question.id === questionId);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= current.nodes.length) return current;
      const nodes = [...current.nodes];
      [nodes[index], nodes[destination]] = [nodes[destination], nodes[index]];
      return makeLinearBuilder(nodes, current.viewport);
    });
  };

  if (formQuery.isLoading || builderQuery.isLoading || !builder) {
    return <main className="flex min-h-dvh items-center justify-center bg-background"><Loader2 className="h-7 w-7 animate-spin text-primary" /></main>;
  }

  if (!formQuery.data) {
    return <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-center text-sm text-muted-foreground">This form could not be found.</main>;
  }

  const { form } = formQuery.data;

  return (
    <main className="min-h-dvh bg-background pb-28">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-xs">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to form" onClick={() => router.push(`/forms/${form.id}`)}><ArrowLeft /></Button>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-bold text-foreground">{form.title}</p>
            <p className={`text-[10px] font-medium ${saveStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>
              {isReadOnly ? "Published · read only" : saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Save failed" : "Saved"}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Preview form" onClick={() => window.open(`/f/${form.publicId}`, "_blank")}><Eye /></Button>
        </div>
      </header>

      <section className="mx-auto max-w-lg space-y-4 px-4 pt-5">
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Form flow</p><h1 className="mt-1 text-xl font-black text-foreground">Questions</h1></div>
          {!isReadOnly && <AddQuestionButton onAdd={(type) => updateBuilder((current) => makeLinearBuilder([...current.nodes, newQuestion(type)], current.viewport))} />}
        </div>

        {isReadOnly && <Card className="border-primary/30 bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">Close responses to edit questions. You can still preview the published form.</Card>}

        {builder.nodes.length === 0 ? (
          <Card className="border-dashed p-6 text-center"><p className="text-sm font-semibold text-foreground">Start with your first question</p><p className="mt-1 text-xs text-muted-foreground">Add a question to create the form flow.</p>{!isReadOnly && <div className="mt-4"><AddQuestionButton onAdd={(type) => updateBuilder((current) => makeLinearBuilder([newQuestion(type)], current.viewport))} /></div>}</Card>
        ) : (
          <ol className="space-y-3">
            {builder.nodes.map((question, index) => {
              const meta = QUESTION_TYPE_META[question.type];
              const Icon = meta.Icon;
              return <li key={question.id}>
                <Card className="p-4">
                  <button className="flex w-full items-start gap-3 text-left" onClick={() => setSelectedQuestionId(question.id)}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">{index + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-foreground">{question.data.title}</span><span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {meta.label}{question.data.required && " · Required"}</span></span>
                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                  {!isReadOnly && <div className="mt-3 flex border-t border-border pt-3"><Button variant="ghost" size="sm" className="min-h-11 flex-1" disabled={index === 0} onClick={() => moveQuestion(question.id, -1)}><ArrowUp /> Up</Button><Button variant="ghost" size="sm" className="min-h-11 flex-1" disabled={index === builder.nodes.length - 1} onClick={() => moveQuestion(question.id, 1)}><ArrowDown /> Down</Button><Button variant="ghost" size="sm" className="min-h-11 flex-1" onClick={() => updateBuilder((current) => { const at = current.nodes.findIndex((item) => item.id === question.id); const nodes = [...current.nodes]; nodes.splice(at + 1, 0, duplicateQuestion(question)); return makeLinearBuilder(nodes, current.viewport); })}><Copy /> Copy</Button><Button variant="ghost" size="sm" className="min-h-11 flex-1 text-destructive hover:text-destructive" onClick={() => { if (window.confirm("Delete this question?")) updateBuilder((current) => makeLinearBuilder(current.nodes.filter((item) => item.id !== question.id), current.viewport)); }}><Trash2 /> Delete</Button></div>}
                </Card>
              </li>;
            })}
          </ol>
        )}
      </section>

      <Dialog open={Boolean(selectedQuestion)} onOpenChange={(open) => !open && setSelectedQuestionId(null)}>
        <DialogContent className="inset-0 h-dvh max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-none p-5 sm:max-w-lg sm:rounded-xl">
          {selectedQuestion && <QuestionEditor question={selectedQuestion} readOnly={Boolean(isReadOnly)} onChange={(update) => updateQuestion(selectedQuestion.id, update)} onClose={() => setSelectedQuestionId(null)} />}
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-center" />
    </main>
  );
}

function AddQuestionButton({ onAdd }: { onAdd: (type: QuestionType) => void }) {
  const [open, setOpen] = useState(false);
  return <><Button size="sm" onClick={() => setOpen(true)}><Plus /> Add</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogTitle>Choose a question type</DialogTitle><div className="mt-4 grid gap-2">{QUESTION_TYPES.map((type) => { const meta = QUESTION_TYPE_META[type]; const Icon = meta.Icon; return <Button key={type} variant="outline" className="h-auto justify-start p-3 text-left" onClick={() => { onAdd(type); setOpen(false); }}><Icon className="shrink-0 text-primary" /><span><span className="block">{meta.label}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{meta.description}</span></span></Button>; })}</div></DialogContent></Dialog></>;
}

function MobileQuestionTypePicker({ type, disabled, onChange }: { type: QuestionType; disabled: boolean; onChange: (type: QuestionType) => void }) {
  const [open, setOpen] = useState(false);
  const active = QUESTION_TYPE_META[type];
  const ActiveIcon = active.Icon;

  return <div className="space-y-2"><Label>Question type</Label><button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="flex min-h-12 w-full items-center justify-between rounded-lg border border-input bg-card px-3 text-left text-sm text-foreground disabled:cursor-not-allowed"><span className="flex items-center gap-2"><ActiveIcon className="h-4 w-4 text-primary" />{active.label}</span><ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-secondary/20 p-2">{QUESTION_TYPES.map((itemType) => { const meta = QUESTION_TYPE_META[itemType]; const Icon = meta.Icon; const selected = itemType === type; return <button type="button" key={itemType} onClick={() => { onChange(itemType); setOpen(false); }} className={`flex min-h-12 items-center gap-2 rounded-md border px-2.5 text-left text-xs font-semibold transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-card text-foreground hover:border-border"}`}><Icon className="h-4 w-4 shrink-0" /><span className="leading-4">{meta.label}</span></button>; })}</div>}</div>;
}

function QuestionEditor({ question, readOnly, onChange, onClose }: { question: MobileQuestion; readOnly: boolean; onChange: (update: (question: MobileQuestion) => MobileQuestion) => void; onClose: () => void }) {
  const data = question.data;
  const setData = (patch: Partial<MobileQuestion["data"]>) => onChange((current) => ({ ...current, data: { ...current.data, ...patch } }));
  const setType = (type: QuestionType) => onChange((current) => ({ ...current, type, data: { ...current.data, options: usesOptions(type) ? current.data.options.length ? current.data.options : [{ id: generateId(), label: "Option 1" }] : [] } }));
  const editOption = (id: string, update: (option: QuestionOption) => QuestionOption) => setData({ options: data.options.map((option) => option.id === id ? update(option) : option) });
  const moveOption = (index: number, direction: -1 | 1) => { const next = index + direction; if (next < 0 || next >= data.options.length) return; const options = [...data.options]; [options[index], options[next]] = [options[next], options[index]]; setData({ options }); };

  return <div className="mx-auto max-w-lg space-y-6 pb-8"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">Question editor</p><DialogTitle className="mt-1">Edit question</DialogTitle></div><Button onClick={onClose}>Done</Button></div><fieldset disabled={readOnly} className="space-y-5 disabled:opacity-60"><MobileQuestionTypePicker type={question.type} disabled={readOnly} onChange={setType} /><div className="space-y-2"><Label htmlFor="question-title">Question</Label><Input id="question-title" value={data.title} onChange={(event) => setData({ title: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="question-description">Description</Label><Textarea id="question-description" value={data.description} onChange={(event) => setData({ description: event.target.value })} placeholder="Optional helper text" /></div><div className="flex items-center justify-between rounded-lg border border-border p-4"><div><p className="text-sm font-semibold text-foreground">Required</p><p className="mt-1 text-xs text-muted-foreground">Respondents must answer this question.</p></div><Switch checked={data.required} onCheckedChange={(required) => setData({ required })} /></div>{usesOptions(question.type) && <div className="space-y-3 border-t border-border pt-5"><div className="flex items-center justify-between"><Label>Options</Label><Button variant="outline" size="sm" onClick={() => setData({ options: [...data.options, { id: generateId(), label: `Option ${data.options.length + 1}` }] })}><Plus /> Add option</Button></div>{data.options.map((option, index) => <div key={option.id} className="flex items-center gap-1.5"><Input value={option.label} onChange={(event) => editOption(option.id, (current) => ({ ...current, label: event.target.value }))} /><Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label="Move option up" onClick={() => moveOption(index, -1)}><ArrowUp /></Button><Button variant="ghost" size="icon-sm" disabled={index === data.options.length - 1} aria-label="Move option down" onClick={() => moveOption(index, 1)}><ArrowDown /></Button><Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label="Delete option" onClick={() => setData({ options: data.options.filter((item) => item.id !== option.id) })}><Trash2 /></Button></div>)}</div>}{question.type === "rating" && <div className="space-y-3 border-t border-border pt-5"><div className="space-y-2"><Label htmlFor="rating-max">Highest rating</Label><Input id="rating-max" type="number" min="1" value={data.ratingMax} onChange={(event) => setData({ ratingMax: Math.max(1, Number(event.target.value) || 1) })} /></div><div className="space-y-2"><Label htmlFor="rating-low">Low label</Label><Input id="rating-low" value={data.ratingLowLabel} onChange={(event) => setData({ ratingLowLabel: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="rating-high">High label</Label><Input id="rating-high" value={data.ratingHighLabel} onChange={(event) => setData({ ratingHighLabel: event.target.value })} /></div></div>}</fieldset></div>;
}
