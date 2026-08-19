import { and, db, eq, forms, inArray, notInArray, questionEdges, questionOptions, questions } from "@repo/db";
import { QUESTION_OPTION_TYPES, type BuilderInput } from "@repo/validators";

export class FormEditingLockedError extends Error {
  constructor() {
    super("Published forms cannot be edited. Close the form before making changes.");
    this.name = "FormEditingLockedError";
  }
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
