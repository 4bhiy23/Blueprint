import type { BuilderData } from "@/features/forms/api";
import type { BuilderEdge, BuilderNode, QuestionFlowNode } from "./types";
import { START_NODE_ID, SUBMIT_NODE_ID } from "./types";

export function serializeBuilder(
  nodes: BuilderNode[],
  edges: BuilderEdge[],
  viewport: BuilderData["viewport"],
): BuilderData {
  const questionNodes = nodes.filter(
    (node): node is QuestionFlowNode => node.type === "question",
  );

  return {
    nodes: questionNodes.map((node) => ({
      id: node.id,
      type: node.data.questionType,
      position: node.position,
      data: {
        title: node.data.title || "Untitled Question",
        description: node.data.description || "",
        required: Boolean(node.data.required),
        options: node.data.options || [],
        ratingMax: node.data.ratingMax ?? 5,
        ratingLowLabel: node.data.ratingLowLabel ?? "",
        ratingHighLabel: node.data.ratingHighLabel ?? "",
      },
    })),
    edges: edges
      .filter((edge) => edge.source !== START_NODE_ID && edge.target !== SUBMIT_NODE_ID)
      .map((edge) => ({ source: edge.source, target: edge.target })),
    viewport,
  };
}
