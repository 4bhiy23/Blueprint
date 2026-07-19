import { type Node, type Edge } from "@xyflow/react";
import { QUESTION_TYPES, QUESTION_OPTION_TYPES } from "@repo/validators";
import {
  Type,
  Hash,
  Mail,
  List,
  Circle,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";

// ─── Re-exported from @repo/validators ─────────────────────────────────────
export { QUESTION_TYPES, QUESTION_OPTION_TYPES };
export type QuestionType = (typeof QUESTION_TYPES)[number];
export type QuestionOptionType = (typeof QUESTION_OPTION_TYPES)[number];

// ─── Question option ────────────────────────────────────────────────────────
export interface QuestionOption {
  id: string;
  label: string;
}

// ─── Node data shapes ───────────────────────────────────────────────────────
export interface QuestionNodeData extends Record<string, unknown> {
  questionType: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: QuestionOption[];
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
};

// ─── Constants ──────────────────────────────────────────────────────────────
export const CANVAS_DROP_ZONE_ID = "canvas-drop-zone";

export const START_NODE_ID = "__start__";
export const SUBMIT_NODE_ID = "__submit__";

export const INITIAL_NODES: BuilderNode[] = [
  {
    id: START_NODE_ID,
    type: "start",
    position: { x: 80, y: 220 },
    data: { label: "Start" },
    deletable: false,
    draggable: true,
  } as StartFlowNode,
  {
    id: SUBMIT_NODE_ID,
    type: "submit",
    position: { x: 560, y: 220 },
    data: { label: "Submit" },
    deletable: false,
    draggable: true,
  } as SubmitFlowNode,
];

export const INITIAL_EDGES: BuilderEdge[] = [];

// ─── ID generator ───────────────────────────────────────────────────────────
export function generateId(): string {
  return `node_${Math.random().toString(36).slice(2, 9)}_${Date.now()}`;
}
