import { randomBytes } from "node:crypto";
import {
  and,
  answers,
  db,
  eq,
  forms,
  questions,
  questionOptions,
  questionEdges,
  inArray,
  responses,
  sql,
} from "@repo/db";
import type { UpdateFormInput } from "@repo/validators";
export { DuplicateResponseError, FormSettingsValidationError, FormUnavailableError, getAvailabilityStatus } from "./form-availability.service.js";
export { SubmissionValidationError, getPublicFormForResponder, submitResponseForPublicForm } from "./form-submission.service.js";
export { getResponseForUser, getResponsesCsvExportForUser, listResponsesForUser } from "./form-responses.service.js";
export { BuilderValidationError, FormEditingLockedError, getBuilderForUser, saveBuilderForUser } from "./form-builder.service.js";
import { FormEditingLockedError } from "./form-builder.service.js";
import { FormSettingsValidationError, getAvailabilityStatus, getResponseCountsByFormId } from "./form-availability.service.js";

function createPublicId() {
  return `frm_${randomBytes(6).toString("base64url")}`;
}

function serializeFormQuestion(
  question: typeof questions.$inferSelect,
  options: (typeof questionOptions.$inferSelect)[],
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
  const userForms = await db.query.forms.findMany({
    where: (formsTable, { eq }) => eq(formsTable.ownerId, userId),
    orderBy: (formsTable, { desc }) => [desc(formsTable.createdAt)],
  });

  const responseCounts = await getResponseCountsByFormId(
    userForms.map((form) => form.id),
  );

  return userForms.map((form) => ({
    ...form,
    responseCount: responseCounts.get(form.id) ?? 0,
    availabilityStatus: getAvailabilityStatus(form, responseCounts.get(form.id) ?? 0),
  }));
}

export async function getFormForUser(input: {
  userId: string;
  formId: string;
}) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
  });

  if (!form) {
    return null;
  }

  const responseCounts = await getResponseCountsByFormId([form.id]);

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
    form: {
      ...form,
      responseCount: responseCounts.get(form.id) ?? 0,
      availabilityStatus: getAvailabilityStatus(form, responseCounts.get(form.id) ?? 0),
    },
    questions: formQuestions.map((question) =>
      serializeFormQuestion(question, formOptions),
    ),
  };
}

export async function getFormAnalyticsForUser(input: {
  userId: string;
  formId: string;
}) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
  });

  if (!form) {
    return null;
  }

  const formResponses = await db.query.responses.findMany({
    where: (responsesTable, { eq }) => eq(responsesTable.formId, form.id),
    orderBy: (responsesTable, { asc }) => [asc(responsesTable.submittedAt)],
  });

  const responsesByDate = new Map<string, number>();
  let completionTotal = 0;
  let completionCount = 0;

  for (const response of formResponses) {
    const date = response.submittedAt.toISOString().slice(0, 10);
    responsesByDate.set(date, (responsesByDate.get(date) ?? 0) + 1);

    if (response.completionMs !== null) {
      completionTotal += response.completionMs;
      completionCount += 1;
    }
  }

  const today = new Date();
  const responsesByDay = Array.from({ length: 14 }, (_, index) => {
    const day = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - (13 - index),
    ));
    const date = day.toISOString().slice(0, 10);

    return {
      date,
      count: responsesByDate.get(date) ?? 0,
    };
  });

  return {
    form: {
      id: form.id,
      title: form.title,
    },
    totalResponses: formResponses.length,
    averageCompletionMs: completionCount
      ? Math.round(completionTotal / completionCount)
      : null,
    responsesByDay,
  };
}

export async function updateFormForUser(input: {
  userId: string;
  formId: string;
} & UpdateFormInput) {
  const existingForm = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
  });

  if (!existingForm) {
    return null;
  }

  if (
    existingForm.status === "published" &&
    (input.title !== undefined || input.description !== undefined)
  ) {
    throw new FormEditingLockedError();
  }

  const opensAt = input.opensAt !== undefined
    ? (input.opensAt ? new Date(input.opensAt) : null)
    : existingForm.opensAt;
  const expiresAt = input.expiresAt !== undefined
    ? (input.expiresAt ? new Date(input.expiresAt) : null)
    : existingForm.expiresAt;

  if (opensAt && expiresAt && opensAt >= expiresAt) {
    throw new FormSettingsValidationError(
      "The closing time must be after the opening time.",
    );
  }

  if (input.responseLimit !== undefined && input.responseLimit !== null) {
    const responseCounts = await getResponseCountsByFormId([existingForm.id]);
    if (input.responseLimit < (responseCounts.get(existingForm.id) ?? 0)) {
      throw new FormSettingsValidationError(
        "The response limit cannot be lower than the number of responses already received.",
      );
    }
  }

  const [updatedForm] = await db
    .update(forms)
    .set({
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() || null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.opensAt !== undefined
        ? { opensAt }
        : {}),
      ...(input.expiresAt !== undefined
        ? { expiresAt }
        : {}),
      ...(input.responseLimit !== undefined
        ? { responseLimit: input.responseLimit }
        : {}),
      ...(input.acceptMultipleResponses !== undefined
        ? { acceptMultipleResponses: input.acceptMultipleResponses }
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
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
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
        and(
          eq(formsTable.id, input.formId),
          eq(formsTable.ownerId, input.userId),
        ),
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
        builderViewport: sourceForm.builderViewport,
      })
      .returning();

    const sourceQuestions = await tx.query.questions.findMany({
      where: (questionsTable, { eq }) =>
        eq(questionsTable.formId, sourceForm.id),
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
          positionX: sourceQuestion.positionX,
          positionY: sourceQuestion.positionY,
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

    const sourceEdges = await tx.query.questionEdges.findMany({
      where: (edgesTable, { eq }) => eq(edgesTable.formId, sourceForm.id),
    });

    for (const sourceEdge of sourceEdges) {
      const sourceQuestionId = questionIdMap.get(sourceEdge.sourceQuestionId);
      const targetQuestionId = questionIdMap.get(sourceEdge.targetQuestionId);

      if (!sourceQuestionId || !targetQuestionId) {
        continue;
      }

      await tx.insert(questionEdges).values({
        formId: newForm.id,
        sourceQuestionId,
        targetQuestionId,
      });
    }

    if (sourceForm.firstQuestionId) {
      await tx
        .update(forms)
        .set({
          firstQuestionId: questionIdMap.get(sourceForm.firstQuestionId) ?? null,
        })
        .where(eq(forms.id, newForm.id));
    }

    return newForm;
  });
}
