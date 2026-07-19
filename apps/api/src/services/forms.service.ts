import { randomBytes } from "node:crypto";
import {
  sql,
  and,
  db,
  eq,
  forms,
  questions,
  questionOptions,
  questionEdges,
  inArray,
  notInArray,
} from "@repo/db";
import type { BuilderInput } from "@repo/validators";

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

function serializeBuilderQuestion(question: typeof questions.$inferSelect) {
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
  for (const node of builder.nodes) {
    if (nodeIds.has(node.id)) {
      throw new BuilderValidationError("Builder graph contains duplicate node ids.");
    }

    nodeIds.add(node.id);
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
  return db.query.forms.findMany({
    where: (formsTable, { eq }) => eq(formsTable.ownerId, userId),
    orderBy: (formsTable, { desc }) => [desc(formsTable.createdAt)],
  });
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
      and(
        eq(formsTable.id, input.formId),
        eq(formsTable.ownerId, input.userId),
      ),
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

// Questions
export async function checkFormForUser(userId: string, formId: string) {
  const [result] = await db
    .select({ exists: sql<boolean>`true` })
    .from(forms)
    .where(
      and(
        eq(forms.id, formId),
        eq(forms.ownerId, userId),
      ),
    )
    .limit(1);

  return !!result;
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

  return {
    nodes: formQuestions.map(serializeBuilderQuestion),
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

    const incomingIds = input.builder.nodes.map((node) => node.id);

    if (incomingIds.length > 0) {
      const existingQuestions = await tx.query.questions.findMany({
        where: (questionsTable, { inArray }) =>
          inArray(questionsTable.id, incomingIds),
      });

      const conflictingQuestion = existingQuestions.find(
        (question) => question.formId !== input.formId,
      );

      if (conflictingQuestion) {
        throw new BuilderValidationError("Builder graph contains a question from another form.");
      }
    }

    const orderIndexByQuestionId = new Map(
      order.map((questionId, orderIndex) => [questionId, orderIndex]),
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
          },
        });
    }

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
        },
      })),
      edges: input.builder.edges,
      viewport: input.builder.viewport,
    };
  });
}
