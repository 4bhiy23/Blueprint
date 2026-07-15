import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { questionTypeEnum } from "./enums.js";
import { forms } from "./forms.js";

export const questions = pgTable("questions", {
  id: uuid("id")
    .defaultRandom()

    .primaryKey(),

  formId: uuid("form_id")
    .notNull()

    .references(() => forms.id, {
      onDelete: "cascade",
      
    }),

  title: text("title").notNull(),

  description: text("description"),

  type: questionTypeEnum("type").notNull(),

  required: boolean("required")
    .notNull()

    .default(false),

  orderIndex: integer("order_index").notNull(),
});
