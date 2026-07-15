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

export const QuestionSchema = z
  .object({
    id: z.string().uuid(),
    formId: z.string().uuid(),
    title: trimmedText(255),
    description: z.string().trim().max(2000).nullable(),
    type: QuestionTypeSchema,
    required: z.boolean(),
    orderIndex: z.number().int().nonnegative(),
  })
  .strict();

export const CreateQuestionSchema = z
  .object({
    title: trimmedText(255),
    description: z.string().trim().max(2000).optional(),
    type: QuestionTypeSchema,
    required: z.boolean().default(false),
    orderIndex: z.number().int().nonnegative(),
    options: z.array(CreateQuestionOptionSchema).optional(),
  })
  .strict()
  .superRefine((question, ctx) => {
    if (
      QUESTION_OPTION_TYPES.includes(question.type as (typeof QUESTION_OPTION_TYPES)[number]) &&
      (!question.options || question.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "This question type requires at least one option.",
      });
    }
  });

export const UpdateQuestionSchema = z
  .object({
    title: trimmedText(255).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    required: z.boolean().optional(),
  })
  .strict();

export const ReorderQuestionSchema = z
  .object({
    id: z.string().uuid(),
    orderIndex: z.number().int().nonnegative(),
  })
  .strict();

export const ReorderQuestionsSchema = z
  .object({
    questions: z.array(ReorderQuestionSchema).min(1),
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
export type QuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
export type ReorderQuestionInput = z.infer<typeof ReorderQuestionSchema>;
export type CreateOptionInput = z.infer<typeof CreateOptionSchema>;
export type UpdateOptionInput = z.infer<typeof UpdateOptionSchema>;
