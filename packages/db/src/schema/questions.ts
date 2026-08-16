import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  doublePrecision,
  index,
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

  positionX: doublePrecision("position_x").notNull().default(0),

  positionY: doublePrecision("position_y").notNull().default(0),

  ratingMax: integer("rating_max"),

  ratingLowLabel: text("rating_low_label"),

  ratingHighLabel: text("rating_high_label"),
}, (table) => [
  index("questions_form_id_idx").on(table.formId),
]);
