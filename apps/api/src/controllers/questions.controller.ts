import { Request, Response } from "express";
import {
  addOptionToQuestionForUser,
  checkOwnershipOfForm,
  deleteQuestionForUser,
  getFormForUser,
  getOptionForUser,
  getQuestionForUser,
  reorderQuestionsForUser,
  updateQuestionForUser,
} from "../services/questions.service.js";
import { getFormId } from "./forms.controller.js";
import {
  CreateOptionSchema,
  ReorderQuestionsSchema,
  UpdateQuestionSchema,
} from "@repo/validators";

export function getUserId(req: Request) {
  return req.user?.id;
}

function getQuestionId(req: Request) {
  const { questionId } = req.params;
  return Array.isArray(questionId) ? questionId[0] : questionId;
}

export const updateQuestion = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const questionId = getQuestionId(req);

  if (!questionId) {
    return res.status(400).json({
      message: "Invalid question id",
    });
  }

  const question = await getQuestionForUser(questionId);

  if (!question) {
    return res.status(404).json({
      message: "Question not found",
    });
  }

  const form = await getFormForUser(question.formId);

  if (!form) {
    return res.status(404).json({
      message: "Form not found",
    });
  }

  const isOwner = await checkOwnershipOfForm(userId, form.ownerId);

  if (!isOwner) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const parsed = UpdateQuestionSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid question payload",
      issues: parsed.error.flatten(),
    });
  }

  const updatedQuestion = await updateQuestionForUser(parsed.data, question);

  return res.status(200).json({
    message: "Question updated successfully",
    data: updatedQuestion,
  });
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const questionId = getQuestionId(req);

  if (!questionId) {
    return res.status(400).json({
      message: "Question ID not provided",
    });
  }

  const question = await getQuestionForUser(questionId);

  if (!question) {
    return res.status(404).json({
      message: "Question not found",
    });
  }

  const form = await getFormForUser(question.formId);

  if (!form) {
    return res.status(404).json({
      message: "Form not found",
    });
  }

  const isOwner = await checkOwnershipOfForm(userId, form.ownerId);

  if (!isOwner) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  await deleteQuestionForUser(
    question.id,
    question.formId,
    question.orderIndex,
  );

  return res.status(204).send();
};

export const addOption = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const questionId = getQuestionId(req);

  if (!questionId) {
    return res.status(400).json({
      message: "Question ID not provided",
    });
  }

  const question = await getQuestionForUser(questionId);

  if (!question) {
    return res.status(404).json({
      message: "Question not found",
    });
  }

  const form = await getFormForUser(question.formId);

  if (!form) {
    return res.status(404).json({
      message: "Form not found",
    });
  }

  const isOwner = await checkOwnershipOfForm(userId, form.ownerId);

  if (!isOwner) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const parsed = CreateOptionSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid option payload",
      issues: parsed.error.flatten(),
    });
  }

  const option = await addOptionToQuestionForUser(question.id, parsed.data);

  return res.status(201).json({
    message: "Option added successfully",
    data: option,
  });
};

export const reorderQuestions = async (
  req: Request,

  res: Response,
) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({
      message: "Form ID not provided",
    });
  }

  const form = await getFormForUser(formId);

  if (!form) {
    return res.status(404).json({
      message: "Form not found",
    });
  }

  const isOwner = await checkOwnershipOfForm(
    userId,

    form.ownerId,
  );

  if (!isOwner) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({
      message: "Invalid questions payload",
    });
  }

  const parsed = ReorderQuestionsSchema.safeParse({ questions });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid questions payload",
      issues: parsed.error.flatten(),
    });
  }

  await reorderQuestionsForUser(
    formId,

    parsed.data.questions,
  );

  return res.status(200).json({
    message: "Questions reordered successfully",
  });
};
