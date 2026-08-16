import { createHash } from "node:crypto";
import type { Request, Response } from "express";
import { SubmitResponseSchema } from "@repo/validators";
import {
  getPublicFormForResponder,
  SubmissionValidationError,
  submitResponseForPublicForm,
} from "../forms/forms.service.js";

function getPublicId(req: Request) {
  const { publicId } = req.params;
  return Array.isArray(publicId) ? publicId[0] : publicId;
}

export async function getPublicForm(req: Request, res: Response) {
  const publicId = getPublicId(req);

  if (!publicId) {
    return res.status(400).json({ error: "Invalid public form id" });
  }

  const form = await getPublicFormForResponder(publicId);

  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(form);
}

export async function submitPublicResponse(req: Request, res: Response) {
  const publicId = getPublicId(req);

  if (!publicId) {
    return res.status(400).json({ error: "Invalid public form id" });
  }

  const parsed = SubmitResponseSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      issues: parsed.error.flatten(),
    });
  }

  const ipHash = createHash("sha256").update(req.ip ?? "unknown").digest("hex");
  const userAgent = req.get("user-agent") ?? null;

  try {
    const response = await submitResponseForPublicForm({
      publicId,
      answers: parsed.data.answers,
      completionMs: parsed.data.completionMs,
      ipHash,
      userAgent,
    });

    if (!response) {
      return res.status(404).json({ error: "Form not found" });
    }

    return res.status(201).json({ response });
  } catch (error) {
    if (error instanceof SubmissionValidationError) {
      return res.status(400).json({ error: error.message });
    }

    throw error;
  }
}
