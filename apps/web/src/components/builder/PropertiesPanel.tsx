"use client";

import { useCallback, useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowRight, ArrowUp, GitBranch, GripVertical, Plus, Trash2 } from "lucide-react";
import type { RouteCondition, RouteConditionGroup } from "@repo/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  QUESTION_TYPE_META,
  QUESTION_OPTION_TYPES,
  type QuestionNodeData,
  type QuestionOption,
  type QuestionFlowNode,
  type BuilderEdge,
  SUBMIT_NODE_ID,
  generateId,
} from "./types";

const NEXT_QUESTION_ID = "__next__";

function questionCondition(question: QuestionFlowNode): RouteCondition {
  if (question.data.questionType === "rating") {
    return { kind: "rating", questionId: question.id, operator: "gte", value: 1 };
  }
  if (question.data.questionType === "checkbox") {
    return {
      kind: "checkbox",
      questionId: question.id,
      operator: "contains",
      optionIds: question.data.options[0] ? [question.data.options[0].id] : [],
    };
  }
  return {
    kind: "option",
    questionId: question.id,
    operator: "is",
    optionId: question.data.options[0]?.id ?? generateId(),
  };
}

function routeLabel(group: RouteConditionGroup) {
  return `${group.match === "all" ? "All" : "Any"} · ${group.conditions.length}`;
}

function RoutingPanel({
  sourceId,
  questions,
  edges,
  onEdgesChange,
}: {
  sourceId: string;
  questions: QuestionFlowNode[];
  edges: BuilderEdge[];
  onEdgesChange: (edges: BuilderEdge[]) => void;
}) {
  const ordered = questions;
  const sourceIndex = ordered.findIndex((question) => question.id === sourceId);
  const conditionQuestions = ordered.slice(0, sourceIndex + 1).filter((question) =>
    ["select", "radio", "checkbox", "rating"].includes(question.data.questionType) &&
    (question.data.questionType === "rating" || question.data.options.length > 0),
  );
  const destinations = ordered.slice(sourceIndex + 1);
  const routes = edges
    .filter((edge) => edge.source === sourceId && edge.data?.condition)
    .sort((a, b) => (a.data?.orderIndex ?? 0) - (b.data?.orderIndex ?? 0));
  const fallbackQuestion = destinations[0];
  const fallbackRoute = edges.find(
    (edge) => edge.source === sourceId && edge.data?.kind === "fallback",
  );

  const replaceRoutes = (nextRoutes: BuilderEdge[]) => {
    const untouched = edges.filter((edge) => edge.source !== sourceId || !edge.data?.condition);
    const normalized = nextRoutes.map((edge, index) => ({
      ...edge,
      data: { ...edge.data!, orderIndex: index, label: `Rule ${index + 1}` },
    }));
    onEdgesChange([...untouched, ...normalized]);
  };

  const updateGroup = (edgeId: string, group: RouteConditionGroup) => {
    replaceRoutes(routes.map((edge) =>
      edge.id === edgeId ? { ...edge, data: { ...edge.data!, condition: group } } : edge,
    ));
  };

  const updateTarget = (edgeId: string, target: string) => {
    replaceRoutes(routes.map((edge) => edge.id === edgeId ? { ...edge, target } : edge));
  };

  const updateFallback = (target: string) => {
    const withoutFallback = edges.filter(
      (edge) => !(edge.source === sourceId && edge.data?.kind === "fallback"),
    );
    if (target === NEXT_QUESTION_ID) {
      onEdgesChange(withoutFallback);
      return;
    }
    onEdgesChange([
      ...withoutFallback,
      {
        id: `edge_fallback_${sourceId}_${generateId()}`,
        source: sourceId,
        target,
        type: "automatic",
        data: {
          condition: null,
          kind: "fallback",
          orderIndex: routes.length,
          label: target === SUBMIT_NODE_ID ? "Submit" : "Otherwise",
        },
      },
    ]);
  };

  const addRule = () => {
    const question = conditionQuestions.at(-1);
    if (!question) return;
    const condition = questionCondition(question);
    if ((condition.kind === "option" && !question.data.options[0]) ||
        (condition.kind === "checkbox" && condition.optionIds.length === 0)) return;
    const target = destinations[0]?.id ?? SUBMIT_NODE_ID;
    replaceRoutes([...routes, {
      id: `edge_${sourceId}_${generateId()}`,
      source: sourceId,
      target,
      type: "automatic",
      data: {
        condition: { match: "all", conditions: [condition] },
        kind: "branch",
        orderIndex: routes.length,
        label: `Rule ${routes.length + 1}`,
      },
    }]);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <GitBranch className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Branching</h3>
            <p className="text-[11px] text-muted-foreground">After this question</p>
          </div>
        </div>
        <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
          Rules run from top to bottom. The first matching rule decides what respondents see next.
        </p>
      </div>

      {!conditionQuestions.length && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center">
          <p className="text-xs font-medium text-foreground">No answers available for a condition</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Add an option to a choice question, or place a rating question before this one.
          </p>
        </div>
      )}

      {routes.map((edge, routeIndex) => {
        const group = edge.data!.condition!;
        return (
          <section key={edge.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/25 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {routeIndex + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-foreground">Rule {routeIndex + 1}</p>
                  <p className="text-[10px] text-muted-foreground">Priority {routeIndex + 1}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button type="button" aria-label="Move rule up" disabled={routeIndex === 0} onClick={() => {
                  const next = [...routes];
                  [next[routeIndex - 1], next[routeIndex]] = [next[routeIndex], next[routeIndex - 1]];
                  replaceRoutes(next);
                }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="Move rule down" disabled={routeIndex === routes.length - 1} onClick={() => {
                  const next = [...routes];
                  [next[routeIndex], next[routeIndex + 1]] = [next[routeIndex + 1], next[routeIndex]];
                  replaceRoutes(next);
                }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="Delete rule" onClick={() => replaceRoutes(routes.filter((item) => item.id !== edge.id))} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-foreground">When</span>
                <div className="flex rounded-md border border-border bg-muted/30 p-0.5" role="group" aria-label={`Rule ${routeIndex + 1} match mode`}>
                  {(["all", "any"] as const).map((match) => (
                    <button
                      key={match}
                      type="button"
                      aria-pressed={group.match === match}
                      onClick={() => updateGroup(edge.id, { ...group, match })}
                      className={cn(
                        "rounded-sm px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        group.match === match ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Match {match}
                    </button>
                  ))}
                </div>
              </div>

              {group.conditions.map((condition, conditionIndex) => {
              const referenced = ordered.find((question) => question.id === condition.questionId);
              const setCondition = (next: RouteCondition) => updateGroup(edge.id, {
                ...group,
                conditions: group.conditions.map((item, index) => index === conditionIndex ? next : item),
              });
              return (
                <div key={`${edge.id}-${conditionIndex}`} className="space-y-2 rounded-lg border border-border bg-muted/20 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Condition {conditionIndex + 1}</span>
                    {group.conditions.length > 1 && <button type="button" aria-label={`Remove condition ${conditionIndex + 1}`} onClick={() => updateGroup(edge.id, { ...group, conditions: group.conditions.filter((_, index) => index !== conditionIndex) })} className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive">Remove</button>}
                  </div>
                  <select aria-label="Condition question" value={condition.questionId} onChange={(event) => {
                    const nextQuestion = conditionQuestions.find((question) => question.id === event.target.value);
                    if (nextQuestion) setCondition(questionCondition(nextQuestion));
                  }} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {conditionQuestions.map((question) => <option key={question.id} value={question.id}>{question.data.title || "Untitled question"}</option>)}
                  </select>

                  {condition.kind === "rating" ? (
                    <div className="flex gap-1.5">
                      <select aria-label="Rating operator" value={condition.operator} onChange={(event) => setCondition({ ...condition, operator: event.target.value as typeof condition.operator })} className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs">
                        <option value="eq">equals</option><option value="lt">is less than</option><option value="lte">is at most</option><option value="gt">is greater than</option><option value="gte">is at least</option>
                      </select>
                      <Input aria-label="Rating value" type="number" min={1} max={referenced?.data.ratingMax ?? 5} value={condition.value} onChange={(event) => setCondition({ ...condition, value: Number(event.target.value) })} className="h-9 w-16 text-xs" />
                    </div>
                  ) : condition.kind === "option" ? (
                    <div className="flex gap-1.5">
                      <select aria-label="Option operator" value={condition.operator} onChange={(event) => setCondition({ ...condition, operator: event.target.value as typeof condition.operator })} className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"><option value="is">is</option><option value="isNot">is not</option></select>
                      <select aria-label="Option" value={condition.optionId} onChange={(event) => setCondition({ ...condition, optionId: event.target.value })} className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs">
                        {referenced?.data.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <select aria-label="Checkbox operator" value={condition.operator} onChange={(event) => setCondition({ ...condition, operator: event.target.value as typeof condition.operator })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"><option value="contains">contains</option><option value="containsAny">contains any</option><option value="containsAll">contains all</option></select>
                      {condition.operator === "contains" ? (
                        <select aria-label="Checkbox option" value={condition.optionIds[0]} onChange={(event) => setCondition({ ...condition, optionIds: [event.target.value] })} className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs">
                          {referenced?.data.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                        </select>
                      ) : (
                        <div className="grid gap-1" aria-label="Checkbox options">
                          {referenced?.data.options.map((option) => {
                            const selected = condition.optionIds.includes(option.id);
                            return <button key={option.id} type="button" aria-pressed={selected} onClick={() => {
                              const optionIds = selected
                                ? condition.optionIds.filter((id) => id !== option.id)
                                : [...condition.optionIds, option.id];
                              if (optionIds.length) setCondition({ ...condition, optionIds });
                            }} className={cn("flex min-h-8 items-center rounded-md border px-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selected ? "border-primary/50 bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground")}>{option.label}</button>;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}

              <Button type="button" variant="ghost" size="sm" className="h-8 w-full justify-start border border-dashed border-border text-xs text-muted-foreground hover:text-foreground" disabled={!conditionQuestions.length || group.conditions.length >= 10} onClick={() => {
                const question = conditionQuestions.at(-1);
                if (question) updateGroup(edge.id, { ...group, conditions: [...group.conditions, questionCondition(question)] });
              }}><Plus className="h-3.5 w-3.5" /> Add condition</Button>

              <div className="flex items-center gap-2 rounded-lg bg-primary/8 p-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"><ArrowRight className="h-3.5 w-3.5" /></span>
                <label className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Then go to
                  <select value={edge.target} onChange={(event) => updateTarget(edge.id, event.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-xs font-normal normal-case tracking-normal text-foreground">
                    {destinations.map((question) => <option key={question.id} value={question.id}>{question.data.title || "Untitled question"}</option>)}
                    <option value={SUBMIT_NODE_ID}>Submit form</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addRule} disabled={!conditionQuestions.length} className="h-9 w-full gap-1.5 border-dashed text-xs">
        <Plus className="h-3.5 w-3.5" /> {routes.length ? "Add another rule" : "Add first rule"}
      </Button>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3">
        <ArrowDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <label className="text-xs font-medium text-foreground" htmlFor={`fallback-${sourceId}`}>
            Otherwise
          </label>
          <select
            id={`fallback-${sourceId}`}
            value={fallbackRoute?.target ?? NEXT_QUESTION_ID}
            onChange={(event) => updateFallback(event.target.value)}
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
          >
            <option value={NEXT_QUESTION_ID}>
              {fallbackQuestion
                ? `Continue to ${fallbackQuestion.data.title || "Untitled question"}`
                : "Submit form"}
            </option>
            {destinations.slice(1).map((question) => (
              <option key={question.id} value={question.id}>
                Go to {question.data.title || "Untitled question"}
              </option>
            ))}
            {fallbackQuestion && <option value={SUBMIT_NODE_ID}>Submit form</option>}
          </select>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Used when none of the conditional rules match.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Option row (sortable)
   ───────────────────────────────────────────────────────────────────────── */
interface OptionRowProps {
  option: QuestionOption;
  onLabelChange: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

function OptionRow({ option, onLabelChange, onDelete }: OptionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2"
    >
      <button
        {...listeners}
        {...attributes}
        className="shrink-0 cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={option.label}
        onChange={(e) => onLabelChange(option.id, e.target.value)}
        placeholder="Option label"
        className={cn(
          "h-7 text-xs flex-1",
          !option.label.trim() && "border-destructive/40 focus-visible:ring-destructive/50"
        )}
      />
      <button
        onClick={() => onDelete(option.id)}
        className="shrink-0 text-muted-foreground/30 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Section wrapper
   ───────────────────────────────────────────────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label>{title}</Label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Form Settings (no node selected)
   ───────────────────────────────────────────────────────────────────────── */
interface FormSettingsPanelProps {
  formTitle: string;
  formDescription: string;
  onFormTitleChange: (v: string) => void;
  onFormDescriptionChange: (v: string) => void;
}

function FormSettingsPanel({
  formTitle,
  formDescription,
  onFormTitleChange,
  onFormDescriptionChange,
}: FormSettingsPanelProps) {
  return (
    <div className="space-y-5 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Form Settings</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Configure global form properties
        </p>
      </div>

      <Separator />

      <Section title="Form Title">
        <Input
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          placeholder="Untitled Form"
          className={cn(
            "text-sm",
            !formTitle.trim() && "border-destructive/40"
          )}
        />
        {!formTitle.trim() && (
          <p className="text-[11px] text-destructive">Title is required</p>
        )}
      </Section>

      <Section title="Description">
        <Textarea
          value={formDescription}
          onChange={(e) => onFormDescriptionChange(e.target.value)}
          placeholder="Describe what this form is about..."
          className="text-sm min-h-[80px]"
        />
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Question Settings (node selected)
   ───────────────────────────────────────────────────────────────────────── */
interface QuestionSettingsPanelProps {
  nodeId: string;
  data: QuestionNodeData;
  edges: BuilderEdge[];
  onEdgesChange: (edges: BuilderEdge[]) => void;
  onDataChange: (patch: Partial<QuestionNodeData>) => void;
  onOptionsReorder: (options: QuestionOption[]) => void;
}

function QuestionSettingsPanel({
  nodeId,
  data,
  edges,
  onEdgesChange,
  onDataChange,
  onOptionsReorder,
}: QuestionSettingsPanelProps) {
  const meta = QUESTION_TYPE_META[data.questionType];
  const { Icon } = meta;
  const showOptions = (QUESTION_OPTION_TYPES as readonly string[]).includes(
    data.questionType
  );

  const handleAddOption = useCallback(() => {
    const newOption: QuestionOption = {
      id: generateId(),
      label: `Option ${data.options.length + 1}`,
    };
    onDataChange({ options: [...data.options, newOption] });
  }, [data.options, onDataChange]);

  const handleOptionLabelChange = useCallback(
    (id: string, label: string) => {
      onDataChange({
        options: data.options.map((o) => (o.id === id ? { ...o, label } : o)),
      });
    },
    [data.options, onDataChange]
  );

  const handleOptionDelete = useCallback(
    (id: string) => {
      onDataChange({ options: data.options.filter((o) => o.id !== id) });
      onEdgesChange(edges.flatMap((edge) => {
        const group = edge.data?.condition;
        if (!group) return [edge];
        const conditions = group.conditions.flatMap((condition) => {
          if (condition.questionId !== nodeId) return [condition];
          if (condition.kind === "option") return condition.optionId === id ? [] : [condition];
          if (condition.kind !== "checkbox") return [condition];
          const optionIds = condition.optionIds.filter((optionId) => optionId !== id);
          return optionIds.length ? [{ ...condition, optionIds }] : [];
        });
        return conditions.length
          ? [{ ...edge, data: { ...edge.data!, condition: { ...group, conditions }, label: routeLabel({ ...group, conditions }) } }]
          : [];
      }));
    },
    [data.options, edges, nodeId, onDataChange, onEdgesChange]
  );

  return (
    <div className="space-y-5 p-4">
      {/* Type indicator */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="text-[11px] text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      <Separator />

      {/* Question title */}
      <Section title="Question Title">
        <Input
          value={data.title}
          onChange={(e) => onDataChange({ title: e.target.value })}
          placeholder="Enter your question..."
          className={cn(
            "text-sm",
            !data.title.trim() && "border-destructive/40"
          )}
        />
        {!data.title.trim() && (
          <p className="text-[11px] text-destructive">
            Question title is required
          </p>
        )}
      </Section>

      {/* Description */}
      <Section title="Description (optional)">
        <Textarea
          value={data.description}
          onChange={(e) => onDataChange({ description: e.target.value })}
          placeholder="Add helper text for this question..."
          className="text-sm min-h-[64px]"
        />
      </Section>

      {/* Required toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Required</Label>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Respondents must answer
          </p>
        </div>
        <Switch
          checked={data.required}
          onCheckedChange={(checked) => onDataChange({ required: checked })}
        />
      </div>

      {/* Options (only for select/radio/checkbox) */}
      {showOptions && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Options</Label>

            {data.options.length > 0 ? (
              <SortableContext
                items={data.options.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {data.options.map((opt) => (
                    <OptionRow
                      key={opt.id}
                      option={opt}
                      onLabelChange={handleOptionLabelChange}
                      onDelete={handleOptionDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic">
                No options yet. Add one below.
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="h-7 w-full gap-1.5 text-xs border-dashed"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Option
            </Button>
          </div>
        </>
      )}

      {data.questionType === "rating" && (
        <>
          <Separator />
          <div className="space-y-3">
            <Section title="Rating scale">
              <Input
                type="number"
                min={1}
                value={data.ratingMax}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  const ratingMax = Number.isInteger(value) && value >= 1 ? value : 1;
                  onDataChange({ ratingMax });
                  onEdgesChange(edges.map((edge) => {
                    const group = edge.data?.condition;
                    if (!group) return edge;
                    return {
                      ...edge,
                      data: {
                        ...edge.data!,
                        condition: {
                          ...group,
                          conditions: group.conditions.map((condition) =>
                            condition.kind === "rating" && condition.questionId === nodeId
                              ? { ...condition, value: Math.min(condition.value, ratingMax) }
                              : condition,
                          ),
                        },
                      },
                    };
                  }));
                }}
              />
              <p className="text-[11px] text-muted-foreground">Ratings always start at 1.</p>
            </Section>
            <Section title="Low label (optional)">
              <Input
                value={data.ratingLowLabel}
                onChange={(event) => onDataChange({ ratingLowLabel: event.target.value })}
                placeholder="e.g. Not likely"
              />
            </Section>
            <Section title="High label (optional)">
              <Input
                value={data.ratingHighLabel}
                onChange={(event) => onDataChange({ ratingHighLabel: event.target.value })}
                placeholder="e.g. Very likely"
              />
            </Section>
          </div>
        </>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Properties Panel (root)
   ───────────────────────────────────────────────────────────────────────── */
export interface PropertiesPanelProps {
  selectedNodeId: string | null;
  selectedNodeData: QuestionNodeData | null;
  questions: QuestionFlowNode[];
  edges: BuilderEdge[];
  onEdgesChange: (edges: BuilderEdge[]) => void;
  formTitle: string;
  formDescription: string;
  onFormTitleChange: (v: string) => void;
  onFormDescriptionChange: (v: string) => void;
  onQuestionDataChange: (patch: Partial<QuestionNodeData>) => void;
  onOptionsReorder: (options: QuestionOption[]) => void;
}

export function PropertiesPanel({
  selectedNodeId,
  selectedNodeData,
  questions,
  edges,
  onEdgesChange,
  formTitle,
  formDescription,
  onFormTitleChange,
  onFormDescriptionChange,
  onQuestionDataChange,
  onOptionsReorder,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<"question" | "logic">("question");
  const ruleCount = selectedNodeId
    ? edges.filter((edge) => edge.source === selectedNodeId && edge.data?.condition).length
    : 0;

  return (
    <aside className="flex h-full min-h-0 w-96 shrink-0 flex-col border-l border-border bg-card/40">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {selectedNodeData ? "Question" : "Form Settings"}
        </h2>
        {selectedNodeData && (
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-border bg-muted/25 p-1" role="tablist" aria-label="Question editing sections">
            <button type="button" role="tab" aria-selected={activeTab === "question"} onClick={() => setActiveTab("question")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeTab === "question" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Question</button>
            <button type="button" role="tab" aria-selected={activeTab === "logic"} onClick={() => setActiveTab("logic")} className={cn("flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeTab === "logic" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              Logic
              {ruleCount > 0 && <span className="flex min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] text-primary">{ruleCount}</span>}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="min-h-0 flex-1">
        {selectedNodeData && selectedNodeId && activeTab === "logic" ? (
          <RoutingPanel
            sourceId={selectedNodeId}
            questions={questions}
            edges={edges}
            onEdgesChange={onEdgesChange}
          />
        ) : selectedNodeData && selectedNodeId ? (
          <QuestionSettingsPanel
            nodeId={selectedNodeId}
            data={selectedNodeData}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onDataChange={onQuestionDataChange}
            onOptionsReorder={onOptionsReorder}
          />
        ) : (
          <FormSettingsPanel
            formTitle={formTitle}
            formDescription={formDescription}
            onFormTitleChange={onFormTitleChange}
            onFormDescriptionChange={onFormDescriptionChange}
          />
        )}
        <div className="h-8" />
      </ScrollArea>
    </aside>
  );
}
