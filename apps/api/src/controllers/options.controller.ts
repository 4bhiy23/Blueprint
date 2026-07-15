import { Request, Response } from "express";
import {
  checkOwnershipOfForm,
  getFormForUser,
  getOptionForUser,
  getQuestionForUser,
} from "../services/questions.service.js";
import { deleteOptionForUser, updateOptionForUser } from "../services/options.service.js";
import { UpdateOptionSchema } from "@repo/validators";

function getUserId(req: Request) {
  return req.user?.id;
}

function getOptionId(req: Request) {
  const { optionId } = req.params;
  return Array.isArray(optionId) ? optionId[0] : optionId;
}

export const updateOption = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const optionId = getOptionId(req);

  if (!optionId) {
    return res.status(400).json({
      message: "Option ID not provided",
    });
  }

  const option = await getOptionForUser(optionId);

  if (!option) {
    return res.status(404).json({
      message: "Option not found",
    });
  }

  const question = await getQuestionForUser(option.questionId);

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

  const parsed = UpdateOptionSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid option payload",
      issues: parsed.error.flatten(),
    });
  }

  const updatedOption = await updateOptionForUser(optionId, parsed.data, option);

  return res.status(200).json({
    message: "Option updated successfully",
    data: updatedOption,
  });
};

export const deleteOption = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const optionId = getOptionId(req);

  if (!optionId) {
    return res.status(400).json({
      message: "Option ID not provided",
    });
  }

  const option = await getOptionForUser(optionId);

  if (!option) {
    return res.status(404).json({
      message: "Option not found",
    });
  }

  const question = await getQuestionForUser(option.questionId);

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

  await deleteOptionForUser(option.id, option.questionId, option.orderIndex);

  return res.status(204).send();
};
