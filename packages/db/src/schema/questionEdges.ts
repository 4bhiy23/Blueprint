import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { forms } from "./forms.js";
import { questions } from "./questions.js";

export const questionEdges = pgTable("question_edges", {
  id: uuid("id").defaultRandom().primaryKey(),

  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, {
      onDelete: "cascade",
    }),

  sourceQuestionId: uuid("source_question_id")
    .notNull()
    .references(() => questions.id, {
      onDelete: "cascade",
    }),

  targetQuestionId: uuid("target_question_id")
    .notNull()
    .references(() => questions.id, {
      onDelete: "cascade",
    }),
}, (table) => [
  index("question_edges_form_id_idx").on(table.formId),
  index("question_edges_source_question_id_idx").on(table.sourceQuestionId),
  index("question_edges_target_question_id_idx").on(table.targetQuestionId),
]);
