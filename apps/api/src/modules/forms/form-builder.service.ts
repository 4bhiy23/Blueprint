import { and, db, eq, forms, inArray, notInArray, questionEdges, questionOptions, questions } from "@repo/db";
import { QUESTION_OPTION_TYPES, type BuilderInput, type RouteConditionGroup } from "@repo/validators";

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

function validateBuilderRules(builder: BuilderInput) {
  if (builder.nodes.length === 0) {
    if (builder.edges.length > 0) {
      throw new BuilderValidationError("Branch rules cannot be saved without questions.");
    }

    return {
      firstQuestionId: null,
      order: [],
    };
  }

  const nodeIds = new Set<string>();
  const optionIds = new Set<string>();
  const nodesById = new Map(builder.nodes.map((node) => [node.id, node]));
  const order = builder.nodes.map((node) => node.id);
  const orderIndex = new Map(order.map((id, index) => [id, index]));
  const optionQuestionId = new Map<string, string>();
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
      optionQuestionId.set(option.id, node.id);
    }

    if (node.type === "rating" && node.data.ratingMax < 1) {
      throw new BuilderValidationError("Rating questions must have a maximum of at least 1.");
    }
  }

  const edgeOrderBySource = new Map<string, Set<number>>();
  const fallbackSources = new Set<string>();

  for (const edge of builder.edges) {
    if (!nodeIds.has(edge.source) || (edge.target && !nodeIds.has(edge.target))) {
      throw new BuilderValidationError("A branch rule references a missing question.");
    }

    if (edge.source === edge.target) {
      throw new BuilderValidationError("A branch cannot return to the same question.");
    }

    if (edge.condition) {
      const usedOrders = edgeOrderBySource.get(edge.source) ?? new Set<number>();
      if (usedOrders.has(edge.orderIndex)) {
        throw new BuilderValidationError("Branch rules after one question must have unique priorities.");
      }
      usedOrders.add(edge.orderIndex);
      edgeOrderBySource.set(edge.source, usedOrders);
    } else {
      if (fallbackSources.has(edge.source)) {
        throw new BuilderValidationError("Each question can have at most one fallback route.");
      }
      fallbackSources.add(edge.source);
    }

    if (edge.target && (orderIndex.get(edge.target) ?? -1) <= (orderIndex.get(edge.source) ?? -1)) {
      throw new BuilderValidationError("A branch can only go to a later question or submit the form.");
    }

    for (const condition of edge.condition?.conditions ?? []) {
      const referencedQuestion = nodesById.get(condition.questionId);
      if (!referencedQuestion) {
        throw new BuilderValidationError("A route condition references a missing question.");
      }
      if ((orderIndex.get(condition.questionId) ?? 0) > (orderIndex.get(edge.source) ?? 0)) {
        throw new BuilderValidationError("Route conditions can only use the current or an earlier question.");
      }
      if (condition.kind === "rating") {
        if (referencedQuestion.type !== "rating") {
          throw new BuilderValidationError("Rating conditions must reference a rating question.");
        }
        if (condition.value > referencedQuestion.data.ratingMax) {
          throw new BuilderValidationError("A rating condition exceeds the question's rating scale.");
        }
      } else if (condition.kind === "checkbox") {
        if (referencedQuestion.type !== "checkbox") {
          throw new BuilderValidationError("Checkbox conditions must reference a checkbox question.");
        }
        if (condition.optionIds.some((id) => optionQuestionId.get(id) !== condition.questionId)) {
          throw new BuilderValidationError("A checkbox condition contains an invalid option.");
        }
      } else {
        if (referencedQuestion.type !== "select" && referencedQuestion.type !== "radio") {
          throw new BuilderValidationError("Option conditions must reference a select or radio question.");
        }
        if (optionQuestionId.get(condition.optionId) !== condition.questionId) {
          throw new BuilderValidationError("An option condition contains an invalid option.");
        }
      }
    }

  }

  return {
    firstQuestionId: order[0] ?? null,
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
      condition: edge.condition as RouteConditionGroup | null,
      orderIndex: edge.orderIndex,
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
    const { firstQuestionId, order } = validateBuilderRules(input.builder);
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
          condition: edge.condition,
          orderIndex: edge.orderIndex,
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
