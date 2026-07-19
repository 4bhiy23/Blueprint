import { Request, Response } from "express";
import {
  addOptionToQuestionForUser,
  checkOwnershipOfForm,
  getFormForUser,
  getOptionForUser,
  getQuestionForUser,
} from "../services/questions.service.js";
import { CreateOptionSchema } from "@repo/validators";

export function getUserId(req: Request) {
  return req.user?.id;
}

function getQuestionId(req: Request) {
  const { questionId } = req.params;
  return Array.isArray(questionId) ? questionId[0] : questionId;
}

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
