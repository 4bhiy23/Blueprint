import { z } from "zod";

const needsOptions = ["select", "radio", "checkbox"] as const;

export const QuestionSchema = z
  .object({
    title: z.string().trim().min(1),
    type: z.string(),
    required: z.boolean(),
    orderIndex: z.number().int().min(0),
    options: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
        }),
      )
      .optional(),
  })
  .superRefine((question, ctx) => {
    if (
      needsOptions.includes(question.type as any) &&
      (!question.options || question.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "This question type requires at least one option.",
      });
    }
  });
