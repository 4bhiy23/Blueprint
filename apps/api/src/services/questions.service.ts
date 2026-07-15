import {
  and,
  db,
  eq,
  forms,
  questionOptions,
  questions,
  gt,
  sql
} from "@repo/db";
import type {
  CreateOptionInput,
  QuestionInput,
  ReorderQuestionInput,
  UpdateQuestionInput,
} from "@repo/validators";

export const addQuestionToDbForUser = async (
  question: QuestionInput,
  formId: string,
) => {
  return await db.transaction(async (tx) => {
    const [createdQuestion] = await tx
      .insert(questions)
      .values({
        formId,
        title: question.title,
        description: question.description,
        type: question.type,
        required: question.required,
        orderIndex: question.orderIndex,
      })
      .returning();

    const createdOptions: typeof questionOptions.$inferSelect[] = [];
    if (question.options?.length) {
      const insertedOptions = await tx.insert(questionOptions).values(
        question.options.map((option) => ({
          questionId: createdQuestion.id,
          label: option.label,
          orderIndex: option.orderIndex,
        })),
      ).returning();

      createdOptions.push(...insertedOptions);
    }

    return {
      ...createdQuestion,
      options: createdOptions,
    };
  });
};

export const getOptionForUser = async (optionId: string) => {
  const [option] = await db
  .select()
  .from(questionOptions)
  .where(eq(questionOptions.id, optionId))

  return option
};

export const getQuestionForUser = async (questionId: string) => {
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  return question;
};

export const getFormForUser = async (formId: string) => {
  const [form] = await db.select().from(forms).where(eq(forms.id, formId));

  return form;
};

export const checkOwnershipOfForm = async (
  userId: string,
  formOwnerId: string,
) => {
  return userId === formOwnerId;
};

export const updateQuestionForUser = async (
  updatedQuestion: UpdateQuestionInput,
  originalQuestion: typeof questions.$inferSelect,
) => {
  const changes: Record<string, unknown> = {};

  if (updatedQuestion.title !== originalQuestion.title) {
    changes.title = updatedQuestion.title;
  }

  if (updatedQuestion.description !== originalQuestion.description) {
    changes.description = updatedQuestion.description;
  }

  if (updatedQuestion.required !== originalQuestion.required) {
    changes.required = updatedQuestion.required;
  }

  if (Object.keys(changes).length === 0) {
    return originalQuestion;
  }

  const [question] = await db
    .update(questions)
    .set(changes)
    .where(eq(questions.id, originalQuestion.id))
    .returning();

  return question;
};

export const deleteQuestionForUser = async (
  questionId: string,
  formId: string,
  deletedOrderIndex: number
) => {
  await db.transaction(async (tx) => {
    // Delete the question
    await tx.delete(questions).where(eq(questions.id, questionId));

    // Re-index
    await tx
      .update(questions)
      .set({
        orderIndex: sql`${questions.orderIndex} - 1`,
      })
      .where(
        and(
          eq(questions.formId, formId),
          gt(questions.orderIndex, deletedOrderIndex),
        ),
      );
  });
};

export const addOptionToQuestionForUser = async (
  questionId: string,
  newOption: CreateOptionInput,
) => {
  const [option] = await db
    .insert(questionOptions)
    .values({
      questionId,
      label: newOption.label,
      orderIndex: newOption.orderIndex,
    })
    .returning();

  return option;
};

export const reorderQuestionsForUser = async (
  formId: string,
  reorderedQuestions: ReorderQuestionInput[],
) => {
  return await db.transaction(async (tx) => {
    for (const question of reorderedQuestions) {
      await tx

        .update(questions)

        .set({
          orderIndex: question.orderIndex,
        })

        .where(
          and(
            eq(questions.id, question.id),

            eq(questions.formId, formId),
          ),
        );
    }

    return true;
  });
};
