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
  notInArray,
  responses,
  sql,
} from "@repo/db";
import type {
  BuilderInput,
  FormAvailabilityStatus,
  SubmitAnswerInput,
  UpdateFormInput,
} from "@repo/validators";
import { QUESTION_OPTION_TYPES } from "@repo/validators";

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

function serializeBuilderQuestion(
  question: typeof questions.$inferSelect,
  options: (typeof questionOptions.$inferSelect)[],
) {
  return {
    id: question.id,
    type: question.type,
    position: {
      x: question.positionX,
      y: question.positionY,
    },
    data: {
      title: question.title,
      description: question.description ?? "",
      required: question.required,
      options: options
        .filter((option) => option.questionId === question.id)
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map((option) => ({ id: option.id, label: option.label })),
      ratingMax: question.ratingMax ?? 5,
      ratingLowLabel: question.ratingLowLabel ?? "",
      ratingHighLabel: question.ratingHighLabel ?? "",
    },
  };
}

export class BuilderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuilderValidationError";
  }
}

export class SubmissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionValidationError";
  }
}

export class FormUnavailableError extends Error {
  constructor(public readonly availabilityStatus: Exclude<FormAvailabilityStatus, "accepting">) {
    const messages: Record<Exclude<FormAvailabilityStatus, "accepting">, string> = {
      not_open_yet: "This form is not accepting responses yet.",
      expired: "This form has expired.",
      response_limit_reached: "This form has reached its response limit.",
      closed: "This form is closed.",
      draft: "This form has not been published yet.",
      archived: "This form has been archived and is unavailable.",
    };
    super(messages[availabilityStatus]);
    this.name = "FormUnavailableError";
  }
}

export class DuplicateResponseError extends Error {
  constructor() {
    super("You have already submitted a response to this form.");
    this.name = "DuplicateResponseError";
  }
}

export function getAvailabilityStatus(
  form: Pick<typeof forms.$inferSelect, "status" | "opensAt" | "expiresAt" | "responseLimit">,
  responseCount: number,
  now = new Date(),
): FormAvailabilityStatus {
  if (form.status === "closed") return "closed";
  if (form.status === "archived") return "archived";
  if (form.status === "draft") return "draft";
  if (form.opensAt && form.opensAt > now) return "not_open_yet";
  if (form.expiresAt && form.expiresAt <= now) return "expired";
  if (form.responseLimit !== null && responseCount >= form.responseLimit) {
    return "response_limit_reached";
  }
  return "accepting";
}

export class FormEditingLockedError extends Error {
  constructor() {
    super("Published forms cannot be edited. Close the form before making changes.");
    this.name = "FormEditingLockedError";
  }
}

export class FormSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormSettingsValidationError";
  }
}

function isValidDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return (
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() === Number(month) - 1 &&
    parsed.getUTCDate() === Number(day)
  );
}

function isValidTimeValue(value: string) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return false;

  const [, hours, minutes, seconds] = match;
  return (
    Number(hours) <= 23 &&
    Number(minutes) <= 59 &&
    (seconds === undefined || Number(seconds) <= 59)
  );
}

function isValidDateTimeValue(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?)$/.exec(value);
  return match !== null && isValidDateValue(match[1]) && isValidTimeValue(match[2]);
}

function validateBuilderGraph(builder: BuilderInput) {
  if (builder.nodes.length === 0) {
    if (builder.edges.length > 0) {
      throw new BuilderValidationError("Edges cannot be saved without nodes.");
    }

    return {
      firstQuestionId: null,
      order: [],
    };
  }

  const nodeIds = new Set<string>();
  const optionIds = new Set<string>();
  for (const node of builder.nodes) {
    if (nodeIds.has(node.id)) {
      throw new BuilderValidationError("Builder graph contains duplicate node ids.");
    }

    nodeIds.add(node.id);

    if (
      !QUESTION_OPTION_TYPES.includes(
        node.type as (typeof QUESTION_OPTION_TYPES)[number],
      ) &&
      node.data.options.length > 0
    ) {
      throw new BuilderValidationError(
        "Only select, radio, and checkbox questions can contain options.",
      );
    }

    for (const option of node.data.options) {
      if (optionIds.has(option.id)) {
        throw new BuilderValidationError(
          "Builder graph contains duplicate option ids.",
        );
      }

      optionIds.add(option.id);
    }

    if (node.type === "rating" && node.data.ratingMax < 1) {
      throw new BuilderValidationError("Rating questions must have a maximum of at least 1.");
    }
  }

  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string>();

  for (const edge of builder.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new BuilderValidationError("Builder graph contains an edge with a missing node.");
    }

    if (edge.source === edge.target) {
      throw new BuilderValidationError("Builder graph cannot contain self-referencing edges.");
    }

    if (outgoing.has(edge.source)) {
      throw new BuilderValidationError("Each question can have at most one outgoing edge.");
    }

    outgoing.set(edge.source, edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);

    if ((incoming.get(edge.target) ?? 0) > 1) {
      throw new BuilderValidationError("Each non-start question must have exactly one incoming edge.");
    }
  }

  const startNodeIds = builder.nodes
    .map((node) => node.id)
    .filter((nodeId) => !incoming.has(nodeId));

  if (startNodeIds.length !== 1) {
    throw new BuilderValidationError("Builder graph must contain exactly one start node.");
  }

  const startNodeId = startNodeIds[0];
  const order: string[] = [];
  const visited = new Set<string>();
  let currentNodeId: string | undefined = startNodeId;

  while (currentNodeId) {
    if (visited.has(currentNodeId)) {
      throw new BuilderValidationError("Builder graph cannot contain cycles.");
    }

    visited.add(currentNodeId);
    order.push(currentNodeId);
    currentNodeId = outgoing.get(currentNodeId);
  }

  if (visited.size !== builder.nodes.length) {
    throw new BuilderValidationError("Every question must be connected to the start node.");
  }

  return {
    firstQuestionId: startNodeId,
    order,
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

async function getResponseCountsByFormId(formIds: string[]) {
  if (formIds.length === 0) {
    return new Map<string, number>();
  }

  const counts = await db
    .select({
      formId: responses.formId,
      responseCount: sql<number>`count(*)`,
    })
    .from(responses)
    .where(inArray(responses.formId, formIds))
    .groupBy(responses.formId);

  return new Map(
    counts.map((count) => [count.formId, Number(count.responseCount)]),
  );
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

export async function listResponsesForUser(input: {
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

  if (!form) return null;

  const formResponses = await db.query.responses.findMany({
    where: (responsesTable, { eq }) => eq(responsesTable.formId, form.id),
    orderBy: (responsesTable, { desc }) => [desc(responsesTable.submittedAt)],
  });

  const responseIds = formResponses.map((r) => r.id);
  const allAnswers = responseIds.length
    ? await db.query.answers.findMany({
        where: (answersTable, { inArray }) => inArray(answersTable.responseId, responseIds),
      })
    : [];

  const optionIds = allAnswers
    .map((a) => a.optionId)
    .filter((id): id is string => id !== null);

  const selectedOptions = optionIds.length
    ? await db.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) => inArray(optionsTable.id, optionIds),
      })
    : [];

  const optionsById = new Map(selectedOptions.map((o) => [o.id, o]));

  // Map answers by responseId and questionId
  const answersByResponse = new Map<string, Array<{ questionId: string; answer: string }>>();

  for (const ans of allAnswers) {
    const list = answersByResponse.get(ans.responseId) ?? [];
    let answerText = ans.value;
    if (ans.optionId) {
      const option = optionsById.get(ans.optionId);
      if (option) {
        answerText = option.label;
      }
    }
    if (answerText) {
      const existing = list.find((a) => a.questionId === ans.questionId);
      if (existing) {
        existing.answer += `, ${answerText}`;
      } else {
        list.push({ questionId: ans.questionId, answer: answerText });
      }
    }
    answersByResponse.set(ans.responseId, list);
  }

  return {
    form: { id: form.id, title: form.title },
    responses: formResponses.map((response) => ({
      id: response.id,
      submittedAt: response.submittedAt,
      completionMs: response.completionMs,
      answers: answersByResponse.get(response.id) ?? [],
    })),
  };
}

export async function getResponsesCsvExportForUser(input: {
  userId: string;
  formId: string;
}) {
  const responseData = await listResponsesForUser(input);

  if (!responseData) {
    return null;
  }

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, input.formId),
    orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
    columns: {
      id: true,
      title: true,
    },
  });

  return {
    ...responseData,
    questions: formQuestions,
  };
}

export async function getResponseForUser(input: {
  userId: string;
  formId: string;
  responseId: string;
}) {
  const form = await db.query.forms.findFirst({
    where: (formsTable, { and, eq }) =>
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
  });

  if (!form) return null;

  const response = await db.query.responses.findFirst({
    where: (responsesTable, { and, eq }) =>
      and(
        eq(responsesTable.id, input.responseId),
        eq(responsesTable.formId, form.id),
      ),
  });

  if (!response) return null;

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, form.id),
    orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
  });
  const questionIds = formQuestions.map((question) => question.id);
  const responseAnswers = await db.query.answers.findMany({
    where: (answersTable, { eq }) => eq(answersTable.responseId, response.id),
  });
  const optionIds = responseAnswers
    .map((answer) => answer.optionId)
    .filter((optionId): optionId is string => optionId !== null);
  const selectedOptions = optionIds.length
    ? await db.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) =>
          inArray(optionsTable.id, optionIds),
      })
    : [];
  const optionsById = new Map(selectedOptions.map((option) => [option.id, option]));
  const answersByQuestionId = new Map<string, (typeof responseAnswers)[number]>();
  const optionLabelsByQuestionId = new Map<string, string[]>();

  for (const answer of responseAnswers) {
    if (answer.optionId) {
      const option = optionsById.get(answer.optionId);
      if (option) {
        const labels = optionLabelsByQuestionId.get(answer.questionId) ?? [];
        labels.push(option.label);
        optionLabelsByQuestionId.set(answer.questionId, labels);
      }
    } else {
      answersByQuestionId.set(answer.questionId, answer);
    }
  }

  return {
    form: { id: form.id, title: form.title },
    response: {
      id: response.id,
      submittedAt: response.submittedAt,
      completionMs: response.completionMs,
      answers: formQuestions.map((question) => ({
        questionId: question.id,
        question: question.title,
        answer:
          optionLabelsByQuestionId.get(question.id)?.join(", ") ??
          answersByQuestionId.get(question.id)?.value ??
          null,
      })),
    },
  };
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

export async function getBuilderForUser(input: {
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

  const formQuestions = await db.query.questions.findMany({
    where: (questionsTable, { eq }) => eq(questionsTable.formId, input.formId),
    orderBy: (questionsTable, { asc }) => [asc(questionsTable.orderIndex)],
  });

  const formEdges = await db.query.questionEdges.findMany({
    where: (edgesTable, { eq }) => eq(edgesTable.formId, input.formId),
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
    nodes: formQuestions.map((question) =>
      serializeBuilderQuestion(question, formOptions),
    ),
    edges: formEdges.map((edge) => ({
      source: edge.sourceQuestionId,
      target: edge.targetQuestionId,
    })),
    viewport: form.builderViewport ?? {},
  };
}

export async function saveBuilderForUser(input: {
  userId: string;
  formId: string;
  builder: BuilderInput;
}) {
  return db.transaction(async (tx) => {
    const { firstQuestionId, order } = validateBuilderGraph(input.builder);
    const form = await tx.query.forms.findFirst({
      where: (formsTable, { and, eq }) =>
        and(
          eq(formsTable.id, input.formId),
          eq(formsTable.ownerId, input.userId),
        ),
    });

    if (!form) {
      return null;
    }

    if (form.status === "published") {
      throw new FormEditingLockedError();
    }

    const incomingIds = input.builder.nodes.map((node) => node.id);
    const incomingOptionIds = input.builder.nodes.flatMap((node) =>
      node.data.options.map((option) => option.id),
    );

    if (incomingIds.length > 0) {
      const existingQuestions = await tx.query.questions.findMany({
        where: (questionsTable, { inArray }) =>
          inArray(questionsTable.id, incomingIds),
      });

      const conflictingQuestion = existingQuestions.find(
        (question) => question.formId !== input.formId,
      );

      if (conflictingQuestion) {
        throw new BuilderValidationError(
          "Builder graph contains a question from another form.",
        );
      }
    }

    if (incomingOptionIds.length > 0) {
      const existingOptions = await tx.query.questionOptions.findMany({
        where: (optionsTable, { inArray }) =>
          inArray(optionsTable.id, incomingOptionIds),
      });
      const existingOptionQuestionIds = [
        ...new Set(existingOptions.map((option) => option.questionId)),
      ];
      const existingOptionQuestions = existingOptionQuestionIds.length
        ? await tx.query.questions.findMany({
            where: (questionsTable, { inArray }) =>
              inArray(questionsTable.id, existingOptionQuestionIds),
          })
        : [];

      if (
        existingOptionQuestions.some(
          (question) => question.formId !== input.formId,
        )
      ) {
        throw new BuilderValidationError(
          "Builder graph contains an option from another form.",
        );
      }
    }

    const orderIndexByQuestionId = new Map(
      order.map((questionId, orderIndex) => [questionId, orderIndex]),
    );

    await tx
      .delete(questions)
      .where(
        incomingIds.length > 0
          ? and(
              eq(questions.formId, input.formId),
              notInArray(questions.id, incomingIds),
            )
          : eq(questions.formId, input.formId),
      );

    for (const node of input.builder.nodes) {
      await tx
        .insert(questions)
        .values({
          id: node.id,
          formId: input.formId,
          title: node.data.title,
          description: node.data.description || null,
          type: node.type,
          required: node.data.required,
          orderIndex: orderIndexByQuestionId.get(node.id) ?? 0,
          positionX: node.position.x,
          positionY: node.position.y,
          ratingMax: node.type === "rating" ? node.data.ratingMax : null,
          ratingLowLabel:
            node.type === "rating" ? node.data.ratingLowLabel || null : null,
          ratingHighLabel:
            node.type === "rating" ? node.data.ratingHighLabel || null : null,
        })
        .onConflictDoUpdate({
          target: questions.id,
          set: {
            title: node.data.title,
            description: node.data.description || null,
            type: node.type,
            required: node.data.required,
            orderIndex: orderIndexByQuestionId.get(node.id) ?? 0,
            positionX: node.position.x,
            positionY: node.position.y,
            ratingMax: node.type === "rating" ? node.data.ratingMax : null,
            ratingLowLabel:
              node.type === "rating" ? node.data.ratingLowLabel || null : null,
            ratingHighLabel:
              node.type === "rating" ? node.data.ratingHighLabel || null : null,
          },
      });
    }

    if (incomingIds.length > 0) {
      await tx
        .delete(questionOptions)
        .where(inArray(questionOptions.questionId, incomingIds));

      const options = input.builder.nodes.flatMap((node) =>
        node.data.options.map((option, orderIndex) => ({
          id: option.id,
          questionId: node.id,
          label: option.label,
          orderIndex,
        })),
      );

      if (options.length > 0) {
        await tx.insert(questionOptions).values(options);
      }
    }

    await tx.delete(questionEdges).where(eq(questionEdges.formId, input.formId));

    if (input.builder.edges.length > 0) {
      await tx.insert(questionEdges).values(
        input.builder.edges.map((edge) => ({
          formId: input.formId,
          sourceQuestionId: edge.source,
          targetQuestionId: edge.target,
        })),
      );
    }

    await tx
      .update(forms)
      .set({
        builderViewport: input.builder.viewport,
        firstQuestionId,
      })
      .where(eq(forms.id, input.formId));

    return {
      nodes: input.builder.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          description: node.data.description || "",
          options: node.data.options,
        },
      })),
      edges: input.builder.edges,
      viewport: input.builder.viewport,
    };
  });
}
