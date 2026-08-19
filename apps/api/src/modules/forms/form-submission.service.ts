import { and, answers, db, eq, forms, inArray, questionOptions, questions, responses, sql } from "@repo/db";
import type { SubmitAnswerInput } from "@repo/validators";
import { DuplicateResponseError, FormUnavailableError, getAvailabilityStatus, getResponseCountsByFormId } from "./form-availability.service.js";

export class SubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionValidationError";
  }
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

function isValidDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() === Number(month) - 1 && parsed.getUTCDate() === Number(day);
}
function isValidTimeValue(value: string) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  return match !== null && Number(match[1]) <= 23 && Number(match[2]) <= 59 && (match[3] === undefined || Number(match[3]) <= 59);
}
function isValidDateTimeValue(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?)$/.exec(value);
  return match !== null && isValidDateValue(match[1]) && isValidTimeValue(match[2]);
}

export async function getPublicFormForResponder(publicId: string, ipHash?: string) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { eq }) => eq(formsTable.publicId, publicId),
  });

  if (!form) {
    return null;
  }

  const responseCounts = await getResponseCountsByFormId([form.id]);
  const availabilityStatus = getAvailabilityStatus(form, responseCounts.get(form.id) ?? 0);
  if (availabilityStatus !== "accepting") {
    return {
      alreadySubmitted: false as const,
      availabilityStatus,
      opensAt: form.opensAt,
      expiresAt: form.expiresAt,
    };
  }

  const alreadySubmitted = !form.acceptMultipleResponses && ipHash
    ? await db.query.responses.findFirst({
        where: (responsesTable, { and, eq }) => and(
          eq(responsesTable.formId, form.id),
          eq(responsesTable.ipHash, ipHash),
        ),
        columns: { id: true },
      })
    : null;

  if (alreadySubmitted) {
    return { alreadySubmitted: true as const, availabilityStatus: "accepting" as const };
  }

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, form.id),
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
    alreadySubmitted: false as const,
    availabilityStatus: "accepting" as const,
    form: {
      id: form.id,
      publicId: form.publicId,
      title: form.title,
      description: form.description,
    },
    questions: formQuestions.map((question) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      type: question.type,
      required: question.required,
      options: serializeFormQuestion(question, formOptions).options.map(
        (option) => ({
          id: option.id,
          label: option.label,
        }),
      ),
      ratingMax: question.ratingMax ?? 5,
      ratingLowLabel: question.ratingLowLabel ?? "",
      ratingHighLabel: question.ratingHighLabel ?? "",
    })),
  };
}

export async function submitResponseForPublicForm(input: {
  publicId: string;
  answers: SubmitAnswerInput[];
  completionMs?: number;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { eq }) => eq(formsTable.publicId, input.publicId),
  });

  if (!form) {
    return null;
  }

  const responseCounts = await getResponseCountsByFormId([form.id]);
  const availabilityStatus = getAvailabilityStatus(form, responseCounts.get(form.id) ?? 0);
  if (availabilityStatus !== "accepting") {
    throw new FormUnavailableError(availabilityStatus);
  }

  const ipHash = input.ipHash;
  if (!form.acceptMultipleResponses && ipHash) {
    const existingResponse = await db.query.responses.findFirst({
      where: (responsesTable, { and, eq }) => and(
        eq(responsesTable.formId, form.id),
        eq(responsesTable.ipHash, ipHash),
      ),
      columns: { id: true },
    });
    if (existingResponse) throw new DuplicateResponseError();
  }

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, form.id),
    orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
  });

  const questionIds = formQuestions.map((question) => question.id);
  const formOptions = questionIds.length
    ? await db.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) =>
          inArray(optionsTable.questionId, questionIds),
      })
    : [];

  const questionsById = new Map(formQuestions.map((question) => [question.id, question]));
  const validOptionIdsByQuestionId = new Map<string, Set<string>>();
  for (const option of formOptions) {
    const optionIds = validOptionIdsByQuestionId.get(option.questionId) ?? new Set<string>();
    optionIds.add(option.id);
    validOptionIdsByQuestionId.set(option.questionId, optionIds);
  }

  const answersByQuestionId = new Map<string, SubmitAnswerInput>();
  for (const answer of input.answers) {
    if (!questionsById.has(answer.questionId)) {
      throw new SubmissionValidationError(
        "Submission contains a question that does not belong to this form.",
      );
    }

    if (answersByQuestionId.has(answer.questionId)) {
      throw new SubmissionValidationError("Each question may only be answered once.");
    }

    answersByQuestionId.set(answer.questionId, answer);
  }

  const answerRows: {
    questionId: string;
    optionIds: string[];
    value: string | null;
  }[] = [];

  for (const question of formQuestions) {
    const answer = answersByQuestionId.get(question.id);
    const validOptionIds = validOptionIdsByQuestionId.get(question.id) ?? new Set<string>();
    const optionIds = answer?.optionIds ?? [];
    const value = answer?.value?.trim();

    if (["select", "radio", "checkbox"].includes(question.type)) {
      if (optionIds.length === 0) {
        if (question.required) {
          throw new SubmissionValidationError(
            `Question "${question.title}" is required.`,
          );
        }
        continue;
      }

      for (const optionId of optionIds) {
        if (!validOptionIds.has(optionId)) {
          throw new SubmissionValidationError(
            `Invalid option for question "${question.title}".`,
          );
        }
      }

      if (question.type !== "checkbox" && optionIds.length !== 1) {
        throw new SubmissionValidationError(
          `Question "${question.title}" requires exactly one selection.`,
        );
      }

      answerRows.push({ questionId: question.id, optionIds, value: null });
      continue;
    }

    if (optionIds.length > 0) {
      throw new SubmissionValidationError(
        `Question "${question.title}" does not accept options.`,
      );
    }

    if (!value) {
      if (question.required) {
        throw new SubmissionValidationError(
          `Question "${question.title}" is required.`,
        );
      }
      continue;
    }

    if (question.type === "number" && Number.isNaN(Number(value))) {
      throw new SubmissionValidationError(
        `Question "${question.title}" must be a number.`,
      );
    }

    if (question.type === "rating") {
      const rating = Number(value);
      const ratingMax = question.ratingMax ?? 5;
      if (!Number.isInteger(rating) || rating < 1 || rating > ratingMax) {
        throw new SubmissionValidationError(
          `Question "${question.title}" requires a rating from 1 to ${ratingMax}.`,
        );
      }
    }

    if (
      question.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      throw new SubmissionValidationError(
        `Question "${question.title}" must be a valid email.`,
      );
    }

    if (question.type === "date" && !isValidDateValue(value)) {
      throw new SubmissionValidationError(
        `Question "${question.title}" must be a valid date.`,
      );
    }

    if (question.type === "time" && !isValidTimeValue(value)) {
      throw new SubmissionValidationError(
        `Question "${question.title}" must be a valid time.`,
      );
    }

    if (
      question.type === "datetime" &&
      !isValidDateTimeValue(value)
    ) {
      throw new SubmissionValidationError(
        `Question "${question.title}" must be a valid date and time.`,
      );
    }

    answerRows.push({ questionId: question.id, optionIds: [], value });
  }

  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${form.id}))`);

    const [responseCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(responses)
      .where(eq(responses.formId, form.id));

    const lockedForm = await tx.query.forms.findFirst({
      where: (formsTable, { eq }) => eq(formsTable.id, form.id),
    });

    if (!lockedForm) return null;

    const lockedAvailability = getAvailabilityStatus(
      lockedForm,
      Number(responseCount.count),
    );
    if (lockedAvailability !== "accepting") {
      throw new FormUnavailableError(lockedAvailability);
    }

    if (!lockedForm.acceptMultipleResponses && ipHash) {
      const existingResponse = await tx.query.responses.findFirst({
        where: (responsesTable, { and, eq }) => and(
          eq(responsesTable.formId, lockedForm.id),
          eq(responsesTable.ipHash, ipHash),
        ),
        columns: { id: true },
      });
      if (existingResponse) throw new DuplicateResponseError();
    }

    const [response] = await tx
      .insert(responses)
      .values({
        formId: form.id,
        completionMs: input.completionMs ?? null,
        ipHash: input.ipHash ?? null,
        userAgent: input.userAgent ?? null,
      })
      .returning();

    const rows: {
      responseId: string;
      questionId: string;
      optionId: string | null;
      value: string | null;
    }[] = [];

    for (const row of answerRows) {
      if (row.optionIds.length > 0) {
        for (const optionId of row.optionIds) {
          rows.push({
            responseId: response.id,
            questionId: row.questionId,
            optionId,
            value: null,
          });
        }
      } else {
        rows.push({
          responseId: response.id,
          questionId: row.questionId,
          optionId: null,
          value: row.value,
        });
      }
    }

    if (rows.length > 0) {
      await tx.insert(answers).values(rows);
    }

    return {
      id: response.id,
      formId: response.formId,
      submittedAt: response.submittedAt,
      completionMs: response.completionMs,
    };
  });
}
