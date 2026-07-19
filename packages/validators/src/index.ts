import { z } from "zod";

export const QUESTION_TYPES = [
  "text",
  "number",
  "email",
  "select",
  "radio",
  "checkbox",
] as const;

export const QUESTION_OPTION_TYPES = ["select", "radio", "checkbox"] as const;

export const QuestionTypeSchema = z.enum(QUESTION_TYPES);
export const QuestionOptionTypeSchema = z.enum(QUESTION_OPTION_TYPES);

const trimmedText = (max = 1000) =>
  z.string().trim().min(1).max(max);

export const FormSchema = z
  .object({
    id: z.string().uuid(),
    ownerId: z.string(),
    title: trimmedText(255),
    description: z.string().trim().max(2000).nullable(),
    status: z.enum(["draft", "published", "closed", "archived"]),
    publicId: z.string(),
    createdAt: z.string().or(z.date()),
  })
  .strict();

export const CreateFormSchema = z
  .object({
    title: trimmedText(255).optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .strict();

export const UpdateFormSchema = CreateFormSchema;

export const QuestionOptionSchema = z
  .object({
    id: z.string().uuid(),
    questionId: z.string().uuid(),
    label: trimmedText(255),
    orderIndex: z.number().int().nonnegative(),
  })
  .strict();

export const CreateQuestionOptionSchema = z
  .object({
    label: trimmedText(255),
    orderIndex: z.number().int().nonnegative(),
  })
  .strict();

export const UpdateQuestionOptionSchema = z
  .object({
    label: trimmedText(255).optional(),
    orderIndex: z.number().int().nonnegative().optional(),
  })
  .strict();

export const BuilderPositionSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
  })
  .strict();

export const BuilderNodeSchema = z
  .object({
    id: z.string().uuid(),
    type: QuestionTypeSchema,
    position: BuilderPositionSchema,
    data: z
      .object({
        title: trimmedText(255),
        description: z.string().trim().max(2000).default(""),
        required: z.boolean().default(false),
      })
      .strict(),
  })
  .strict();

export const BuilderEdgeSchema = z
  .object({
    source: z.string().uuid(),
    target: z.string().uuid(),
  })
  .strict();

export const BuilderViewportSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const BuilderSchema = z
  .object({
    nodes: z.array(BuilderNodeSchema),
    edges: z.array(BuilderEdgeSchema),
    viewport: BuilderViewportSchema,
  })
  .strict();

export const CreateOptionSchema = z
  .object({
    label: trimmedText(255),
    orderIndex: z.number().int().nonnegative(),
  })
  .strict();

export const UpdateOptionSchema = z
  .object({
    label: trimmedText(255).optional(),
    orderIndex: z.number().int().nonnegative().optional(),
  })
  .strict();

export const ResponseSchema = z
  .object({
    id: z.string().uuid(),
    formId: z.string().uuid(),
    submittedAt: z.string().or(z.date()),
    completionMs: z.number().int().nonnegative().nullable().optional(),
    ipHash: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  })
  .strict();

export const AnswerSchema = z
  .object({
    id: z.string().uuid(),
    responseId: z.string().uuid(),
    questionId: z.string().uuid(),
    optionId: z.string().uuid().nullable().optional(),
    value: z.string().nullable().optional(),
  })
  .strict();

export type CreateFormInput = z.infer<typeof CreateFormSchema>;
export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;
export type BuilderInput = z.infer<typeof BuilderSchema>;
export type CreateOptionInput = z.infer<typeof CreateOptionSchema>;
export type UpdateOptionInput = z.infer<typeof UpdateOptionSchema>;
