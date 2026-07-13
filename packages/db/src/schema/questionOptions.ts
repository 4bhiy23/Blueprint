import {
  pgTable,
  uuid,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { questions } from "./questions.js";

export const questionOptions = pgTable("question_options", {
  id: uuid("id")
    .defaultRandom()

    .primaryKey(),

  questionId: uuid("question_id")
    .notNull()

    .references(() => questions.id, {
      onDelete: "cascade",
    }),

  label: text("label").notNull(),

  orderIndex: integer("order_index").notNull(),
});
