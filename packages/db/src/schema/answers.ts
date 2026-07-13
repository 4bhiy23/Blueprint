import {
  pgTable,
  uuid,
  text,
} from "drizzle-orm/pg-core";
import { responses } from "./responses.js";
import { questions } from "./questions.js";
import { questionOptions } from "./questionOptions.js";

export const answers = pgTable("answers", {
  id: uuid("id")
    .defaultRandom()

    .primaryKey(),

  responseId: uuid("response_id")
    .notNull()

    .references(() => responses.id, {
      onDelete: "cascade",
    }),

  questionId: uuid("question_id")
    .notNull()

    .references(() => questions.id, {
      onDelete: "cascade",
    }),

  optionId: uuid("option_id").references(() => questionOptions.id, {
    onDelete: "set null",
  }),

  value: text("value"),
});
