import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { forms } from "./forms.js";

export const responses = pgTable("responses", {
  id: uuid("id")
    .defaultRandom()

    .primaryKey(),

  formId: uuid("form_id")
    .notNull()

    .references(() => forms.id, {
      onDelete: "cascade",
    }),

  submittedAt: timestamp("submitted_at")
    .defaultNow()

    .notNull(),

  completionMs: integer("completion_ms"),

  ipHash: text("ip_hash"),

  userAgent: text("user_agent"),
});
