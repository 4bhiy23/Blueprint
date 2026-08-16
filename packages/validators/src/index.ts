import { z } from "zod";

export const QUESTION_TYPES = [
  "text",
  "number",
  "email",
  "select",
  "radio",
  "checkbox",
  "paragraph",
  "date",
  "datetime",
  "time",
  "rating",
] as const;

export const QUESTION_OPTION_TYPES = ["select", "radio", "checkbox"] as const;

export const QuestionTypeSchema = z.enum(QUESTION_TYPES);
export const QuestionOptionTypeSchema = z.enum(QUESTION_OPTION_TYPES);
export const FormStatusSchema = z.enum([
  "draft",
  "published",
  "closed",
  "archived",
]);

const trimmedText = (max = 1000) =>
  z.string().trim().min(1).max(max);

export const FormSchema = z
  .object({
    id: z.string().uuid(),
    ownerId: z.string(),
    title: trimmedText(255),
    description: z.string().trim().max(2000).nullable(),
    status: FormStatusSchema,
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

export const UpdateFormSchema = CreateFormSchema.extend({
  status: FormStatusSchema.optional(),
});

export const BuilderPositionSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
  })
  .strict();

export const BuilderOptionSchema = z
  .object({
    id: z.string().uuid(),
    label: trimmedText(255),
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
        options: z.array(BuilderOptionSchema).default([]),
        ratingMax: z.number().int().min(1).default(5),
        ratingLowLabel: z.string().trim().max(255).default(""),
        ratingHighLabel: z.string().trim().max(255).default(""),
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

export const SubmitAnswerSchema = z
  .object({
    questionId: z.string().uuid(),
    optionIds: z.array(z.string().uuid()).optional(),
    value: z.string().trim().max(1000).optional(),
  })
  .strict()
  .refine(
    (answer) =>
      (answer.optionIds?.length ?? 0) > 0 || answer.value !== undefined,
    "An answer must include at least one option id or a value.",
  )
  .refine(
    (answer) =>
      !((answer.optionIds?.length ?? 0) > 0 && answer.value !== undefined),
    "An answer cannot include both option ids and a value.",
  );

export const SubmitResponseSchema = z
  .object({
    answers: z.array(SubmitAnswerSchema).max(200),
    completionMs: z
      .number()
      .int()
      .nonnegative()
      .max(86_400_000)
      .optional(),
  })
  .strict();

export type CreateFormInput = z.infer<typeof CreateFormSchema>;
export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;
export type BuilderInput = z.infer<typeof BuilderSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type SubmitResponseInput = z.infer<typeof SubmitResponseSchema>;
