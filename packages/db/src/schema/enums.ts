import { pgEnum } from "drizzle-orm/pg-core";

export const formStatusEnum = pgEnum("blueprint_status", [
  "draft",
  "published",
  "closed",
  "archived",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "text",
  "number",
  "email",
  "select",
  "radio",
  "checkbox",
]);