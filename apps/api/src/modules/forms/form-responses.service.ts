import { and, db, eq, inArray } from "@repo/db";

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
