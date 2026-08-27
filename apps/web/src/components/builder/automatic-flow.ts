import type { BuilderEdge, BuilderNode, QuestionFlowNode } from "./types";
import { START_NODE_ID, SUBMIT_NODE_ID } from "./types";

/**
 * The canvas is the source of truth for question order. Questions are read
 * from top to bottom, with the horizontal position settling ties on a row.
 */
export function getQuestionsInCanvasOrder(
  nodes: BuilderNode[],
): QuestionFlowNode[] {
  return nodes
    .filter((node): node is QuestionFlowNode => node.type === "question")
    .sort(
      (left, right) =>
        left.position.y - right.position.y || left.position.x - right.position.x || left.id.localeCompare(right.id),
    );
}

/** Builds the complete display graph, including the non-persisted start/end nodes. */
export function createAutomaticEdges(nodes: BuilderNode[]): BuilderEdge[] {
  const questions = getQuestionsInCanvasOrder(nodes);
  if (questions.length === 0) return [];

  const firstQuestion = questions[0];
  const lastQuestion = questions.at(-1)!;
  const edges: BuilderEdge[] = [
    {
      id: `edge_${START_NODE_ID}_to_${firstQuestion.id}`,
      source: START_NODE_ID,
      target: firstQuestion.id,
      type: "automatic",
    },
  ];

  for (let index = 0; index < questions.length - 1; index += 1) {
    const source = questions[index].id;
    const target = questions[index + 1].id;
    edges.push({
      id: `edge_${source}_to_${target}`,
      source,
      target,
      type: "automatic",
    });
  }

  edges.push({
    id: `edge_${lastQuestion.id}_to_${SUBMIT_NODE_ID}`,
    source: lastQuestion.id,
    target: SUBMIT_NODE_ID,
    type: "automatic",
  });

  return edges;
}

export function haveSameEdges(left: BuilderEdge[], right: BuilderEdge[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      (edge, index) =>
        edge.id === right[index]?.id &&
        edge.source === right[index]?.source &&
        edge.target === right[index]?.target,
    )
  );
}
