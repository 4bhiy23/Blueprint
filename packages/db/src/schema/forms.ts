import {
  pgTable,
  uuid,
  text,
  timestamp,
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

  createdAt: timestamp("created_at")
    .defaultNow()

    .notNull(),
});
