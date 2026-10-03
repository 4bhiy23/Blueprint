import type { BuilderEdge, BuilderNode, QuestionFlowNode } from "./types";
import { START_NODE_ID, SUBMIT_NODE_ID } from "./types";

/** Question array order is the form order. Canvas coordinates are layout only. */
export function getQuestionsInOrder(
  nodes: BuilderNode[],
): QuestionFlowNode[] {
  return nodes.filter((node): node is QuestionFlowNode => node.type === "question");
}

/** Builds the complete display graph, including the non-persisted start/end nodes. */
export function createAutomaticEdges(nodes: BuilderNode[]): BuilderEdge[] {
  const questions = getQuestionsInOrder(nodes);
  if (questions.length === 0) return [];

  const firstQuestion = questions[0];
  const lastQuestion = questions.at(-1)!;
  const edges: BuilderEdge[] = [
    {
      id: `edge_${START_NODE_ID}_to_${firstQuestion.id}`,
      source: START_NODE_ID,
      target: firstQuestion.id,
      type: "automatic",
      data: { condition: null, kind: "sequence", orderIndex: 0, label: "Start" },
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
      data: { condition: null, kind: "sequence", orderIndex: 0, label: "Otherwise" },
    });
  }

  edges.push({
    id: `edge_${lastQuestion.id}_to_${SUBMIT_NODE_ID}`,
    source: lastQuestion.id,
    target: SUBMIT_NODE_ID,
    type: "automatic",
    data: { condition: null, kind: "sequence", orderIndex: 0, label: "Submit" },
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
