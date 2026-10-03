import assert from "node:assert/strict";
import { resolveNextQuestion, type BuilderEdgeInput } from "./index.ts";

const source = "00000000-0000-4000-8000-000000000001";
const rating = "00000000-0000-4000-8000-000000000002";
const checkbox = "00000000-0000-4000-8000-000000000003";
const selected = "00000000-0000-4000-8000-000000000004";
const target = "00000000-0000-4000-8000-000000000005";
const fallback = "00000000-0000-4000-8000-000000000006";
const questionOrder = [source, target, fallback];

const edges: BuilderEdgeInput[] = [
  {
    source,
    target,
    orderIndex: 0,
    condition: {
      match: "all",
      conditions: [
        { kind: "rating", questionId: rating, operator: "gte", value: 4 },
        { kind: "checkbox", questionId: checkbox, operator: "contains", optionIds: [selected] },
      ],
    },
  },
];

assert.equal(resolveNextQuestion(source, {
  [rating]: { value: "5" },
  [checkbox]: { optionIds: [selected] },
}, questionOrder, edges), target);

assert.equal(resolveNextQuestion(source, {
  [rating]: { value: "3" },
  [checkbox]: { optionIds: [selected] },
}, questionOrder, edges), target);

assert.equal(resolveNextQuestion(target, {}, questionOrder, edges), fallback);
assert.equal(resolveNextQuestion(fallback, {}, questionOrder, edges), null);

assert.equal(resolveNextQuestion(source, {}, questionOrder, [{
  source,
  target: null,
  orderIndex: 0,
  condition: null,
}]), null);

const submitRule: BuilderEdgeInput = {
  source,
  target: null,
  orderIndex: 0,
  condition: {
    match: "any",
    conditions: [{ kind: "rating", questionId: rating, operator: "gte", value: 4 }],
  },
};

assert.equal(resolveNextQuestion(source, {
  [rating]: { value: "5" },
}, questionOrder, [submitRule]), null);

assert.equal(resolveNextQuestion(source, {
  [rating]: { value: "3" },
}, questionOrder, [submitRule, {
  source,
  target: null,
  orderIndex: 1,
  condition: null,
}]), null);
