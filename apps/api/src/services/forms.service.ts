import { randomBytes } from "node:crypto";
import { and, db, eq, forms, questions, questionOptions } from "@repo/db";

function createPublicId() {
  return `frm_${randomBytes(6).toString("base64url")}`;
}

function serializeFormQuestion(
  question: typeof questions.$inferSelect,
  options: typeof questionOptions.$inferSelect[],
) {
  return {
    ...question,
    options: options
      .filter((option) => option.questionId === question.id)
      .sort((left, right) => left.orderIndex - right.orderIndex),
  };
}

export async function createFormForUser(input: {
  userId: string;
  title?: string;
  description?: string;
}) {
  const [form] = await db
    .insert(forms)
    .values({
      ownerId: input.userId,
      title: input.title?.trim() || "Untitled Form",
      description: input.description?.trim() || null,
      publicId: createPublicId(),
      status: "draft",
    })
    .returning();

  return form;
}

export async function listFormsForUser(userId: string) {
  return db.query.forms.findMany({
    where: (formsTable, { eq }) => eq(formsTable.ownerId, userId),
    orderBy: (formsTable, { desc }) => [desc(formsTable.createdAt)],
  });
}

export async function getFormForUser(input: { userId: string; formId: string }) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(eq(formsTable.id, input.formId), eq(formsTable.ownerId, input.userId)),
  });

  if (!form) {
    return null;
  }

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, input.formId),
    orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
  });

  const questionIds = formQuestions.map((question) => question.id);

  const formOptions = questionIds.length
    ? await db.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) =>
          inArray(optionsTable.questionId, questionIds),
        orderBy: (optionsTable, { asc }) => [asc(optionsTable.orderIndex)],
      })
    : [];

  return {
    form,
    questions: formQuestions.map((question) =>
      serializeFormQuestion(question, formOptions),
    ),
  };
}

export async function updateFormForUser(input: {
  userId: string;
  formId: string;
  title?: string;
  description?: string;
}) {
  const existingForm = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(eq(formsTable.id, input.formId), eq(formsTable.ownerId, input.userId)),
  });

  if (!existingForm) {
    return null;
  }

  const [updatedForm] = await db
    .update(forms)
    .set({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() || null }
        : {}),
    })
    .where(eq(forms.id, existingForm.id))
    .returning();

  return updatedForm;
}

export async function deleteFormForUser(input: {
  userId: string;
  formId: string;
}) {
  const existingForm = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(eq(formsTable.id, input.formId), eq(formsTable.ownerId, input.userId)),
  });

  if (!existingForm) {
    return false;
  }

  await db.delete(forms).where(eq(forms.id, existingForm.id));

  return true;
}

export async function duplicateFormForUser(input: {
  userId: string;
  formId: string;
}) {
  return db.transaction(async (tx) => {
    const sourceForm = await tx.query.forms.findFirst({
      where: (formsTable, { and, eq }) =>
        and(eq(formsTable.id, input.formId), eq(formsTable.ownerId, input.userId)),
    });

    if (!sourceForm) {
      return null;
    }

    const [newForm] = await tx
      .insert(forms)
      .values({
        ownerId: input.userId,
        title: `Copy of ${sourceForm.title}`,
        description: sourceForm.description,
        publicId: createPublicId(),
        status: "draft",
      })
      .returning();

    const sourceQuestions = await tx.query.questions.findMany({
      where: (questionsTable, { eq }) => eq(questionsTable.formId, sourceForm.id),
      orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
    });

    const questionIdMap = new Map<string, string>();

    for (const sourceQuestion of sourceQuestions) {
      const [newQuestion] = await tx
        .insert(questions)
        .values({
          formId: newForm.id,
          title: sourceQuestion.title,
          description: sourceQuestion.description,
          type: sourceQuestion.type,
          required: sourceQuestion.required,
          orderIndex: sourceQuestion.orderIndex,
        })
        .returning();

      questionIdMap.set(sourceQuestion.id, newQuestion.id);
    }

    if (sourceQuestions.length > 0) {
      const sourceQuestionIds = sourceQuestions.map((question) => question.id);
      const sourceOptions = await tx.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) =>
          inArray(optionsTable.questionId, sourceQuestionIds),
        orderBy: (optionsTable, { asc }) => [asc(optionsTable.orderIndex)],
      });

      for (const sourceOption of sourceOptions) {
        const nextQuestionId = questionIdMap.get(sourceOption.questionId);

        if (!nextQuestionId) {
          continue;
        }

        await tx.insert(questionOptions).values({
          questionId: nextQuestionId,
          label: sourceOption.label,
          orderIndex: sourceOption.orderIndex,
        });
      }
    }

    return newForm;
  });
}
