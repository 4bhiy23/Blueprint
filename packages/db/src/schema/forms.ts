import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { formStatusEnum } from "./enums.js";
import { user } from "./auth.js";

export const forms = pgTable("forms", {
  id: uuid("id")
    .defaultRandom()

    .primaryKey(),

  ownerId: text("owner_id")
    .notNull()

    .references(() => user.id, {
      onDelete: "cascade",
    }),

  title: text("title").notNull(),

  description: text("description"),

  status: formStatusEnum("status")
    .notNull()

    .default("draft"),

  publicId: text("public_id")
    .notNull()

    .unique(),

  opensAt: timestamp("opens_at"),

  expiresAt: timestamp("expires_at"),

  responseLimit: integer("response_limit"),

  acceptMultipleResponses: boolean("accept_multiple_responses")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at")
    .defaultNow()

    .notNull(),

  builderViewport: jsonb("builder_viewport").$type<Record<string, unknown> | null>(),

  firstQuestionId: uuid("first_question_id"),
});
