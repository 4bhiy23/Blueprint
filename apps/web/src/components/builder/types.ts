import { type Node, type Edge } from "@xyflow/react";
import {
  QUESTION_TYPES,
  QUESTION_OPTION_TYPES,
  type BuilderInput,
  type QuestionOptionType,
  type QuestionType,
} from "@repo/validators";
import {
  Type,
  Hash,
  Mail,
  List,
  Circle,
  CheckSquare,
  CalendarDays,
  Clock3,
  Star,
  AlignLeft,
  type LucideIcon,
} from "lucide-react";

// ─── Re-exported from @repo/validators ─────────────────────────────────────
export { QUESTION_TYPES, QUESTION_OPTION_TYPES };
export type { QuestionOptionType, QuestionType };

// ─── Question option ────────────────────────────────────────────────────────
export type QuestionOption = BuilderInput["nodes"][number]["data"]["options"][number];

// ─── Node data shapes ───────────────────────────────────────────────────────
export interface QuestionNodeData extends Record<string, unknown> {
  questionType: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: QuestionOption[];
  ratingMax: number;
  ratingLowLabel: string;
  ratingHighLabel: string;
}

export interface FixedNodeData extends Record<string, unknown> {
  label: string;
}

// ─── React Flow node types ──────────────────────────────────────────────────
export type QuestionFlowNode = Node<QuestionNodeData, "question">;
export type StartFlowNode = Node<FixedNodeData, "start">;
export type SubmitFlowNode = Node<FixedNodeData, "submit">;
export type BuilderNode = QuestionFlowNode | StartFlowNode | SubmitFlowNode;
export type BuilderEdge = Edge;

// ─── Type metadata ──────────────────────────────────────────────────────────
export interface QuestionTypeMeta {
  label: string;
  description: string;
  Icon: LucideIcon;
  inputPreview: string;
}

export const QUESTION_TYPE_META: Record<QuestionType, QuestionTypeMeta> = {
  text: {
    label: "Short Text",
    description: "Single-line text input",
    Icon: Type,
    inputPreview: "Your answer...",
  },
  number: {
    label: "Number",
    description: "Numeric input field",
    Icon: Hash,
    inputPreview: "0",
  },
  email: {
    label: "Email",
    description: "Email address field",
    Icon: Mail,
    inputPreview: "you@example.com",
  },
  select: {
    label: "Dropdown",
    description: "Single selection from list",
    Icon: List,
    inputPreview: "Select an option...",
  },
  radio: {
    label: "Multiple Choice",
    description: "One option from several",
    Icon: Circle,
    inputPreview: "Option A / Option B",
  },
  checkbox: {
    label: "Checkboxes",
    description: "Multiple selection allowed",
    Icon: CheckSquare,
    inputPreview: "Option A ✓  Option B",
  },
  paragraph: {
    label: "Paragraph",
    description: "Multi-line text response",
    Icon: AlignLeft,
    inputPreview: "Write a longer answer...",
  },
  date: {
    label: "Date",
    description: "Calendar date picker",
    Icon: CalendarDays,
    inputPreview: "Select a date",
  },
  datetime: {
    label: "Date & Time",
    description: "Date and time picker",
    Icon: CalendarDays,
    inputPreview: "Select date and time",
  },
  time: {
    label: "Time",
    description: "Time picker",
    Icon: Clock3,
    inputPreview: "Select a time",
  },
  rating: {
    label: "Rating",
    description: "Scale from 1 to a chosen maximum",
    Icon: Star,
    inputPreview: "1  2  3  4  5",
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────
export const CANVAS_DROP_ZONE_ID = "canvas-drop-zone";

export const START_NODE_ID = "__start__";
export const SUBMIT_NODE_ID = "__submit__";

export const INITIAL_NODES: BuilderNode[] = [
  {
    id: START_NODE_ID,
    type: "start",
    position: { x: 320, y: 80 },
    data: { label: "Start" },
    deletable: false,
    draggable: true,
  } as StartFlowNode,
  {
    id: SUBMIT_NODE_ID,
    type: "submit",
    position: { x: 320, y: 520 },
    data: { label: "Submit" },
    deletable: false,
    draggable: true,
  } as SubmitFlowNode,
];

export const INITIAL_EDGES: BuilderEdge[] = [];

// ─── ID generator ───────────────────────────────────────────────────────────
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for browsers that do not yet support `crypto.randomUUID`.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = (Math.random() * 16) | 0;
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
