"use client";

import { useCallback } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
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
  generateId,
} from "./types";

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
  data: QuestionNodeData;
  onDataChange: (patch: Partial<QuestionNodeData>) => void;
  onOptionsReorder: (options: QuestionOption[]) => void;
}

function QuestionSettingsPanel({
  data,
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
    },
    [data.options, onDataChange]
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
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Properties Panel (root)
   ───────────────────────────────────────────────────────────────────────── */
export interface PropertiesPanelProps {
  selectedNodeData: QuestionNodeData | null;
  formTitle: string;
  formDescription: string;
  onFormTitleChange: (v: string) => void;
  onFormDescriptionChange: (v: string) => void;
  onQuestionDataChange: (patch: Partial<QuestionNodeData>) => void;
  onOptionsReorder: (options: QuestionOption[]) => void;
}

export function PropertiesPanel({
  selectedNodeData,
  formTitle,
  formDescription,
  onFormTitleChange,
  onFormDescriptionChange,
  onQuestionDataChange,
  onOptionsReorder,
}: PropertiesPanelProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card/40">
      {/* Header */}
      <div className="flex h-10 items-center justify-between px-4 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {selectedNodeData ? "Question Settings" : "Form Settings"}
        </h2>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {selectedNodeData ? (
          <QuestionSettingsPanel
            data={selectedNodeData}
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
