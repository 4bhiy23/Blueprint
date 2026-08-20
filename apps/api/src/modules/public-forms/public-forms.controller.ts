import type { Request, Response } from "express";
import { SubmitResponseSchema } from "@repo/validators";
import { getRequestIpFingerprint } from "../../libs/request-fingerprint.js";
import {
  formCacheScope,
  getOrSetCache,
  invalidateCacheScope,
  publicFormCacheScope,
  userFormsCacheScope,
} from "../../libs/api-cache.js";
import {
  getPublicFormForResponder,
  DuplicateResponseError,
  FormUnavailableError,
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

  const ipHash = getRequestIpFingerprint(req);
  const form = await getOrSetCache({
    scope: publicFormCacheScope(publicId),
    resource: `responder:${ipHash}`,
    ttlSeconds: 15,
    load: () => getPublicFormForResponder(publicId, ipHash),
  });

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

  const ipHash = getRequestIpFingerprint(req);
  const userAgent = req.get("user-agent") ?? null;

  try {
    const result = await submitResponseForPublicForm({
      publicId,
      answers: parsed.data.answers,
      completionMs: parsed.data.completionMs,
      ipHash,
      userAgent,
    });

    if (!result) {
      return res.status(404).json({ error: "Form not found" });
    }

    await Promise.all([
      invalidateCacheScope(publicFormCacheScope(publicId)),
      invalidateCacheScope(formCacheScope(result.response.formId)),
      invalidateCacheScope(userFormsCacheScope(result.ownerId)),
    ]);

    return res.status(201).json({ response: result.response });
  } catch (error) {
    if (error instanceof FormUnavailableError) {
      return res.status(410).json({ error: error.message, availabilityStatus: error.availabilityStatus });
    }

    if (error instanceof DuplicateResponseError) {
      return res.status(409).json({ error: error.message });
    }

    if (error instanceof SubmissionValidationError) {
      return res.status(400).json({ error: error.message });
    }

    throw error;
  }
}
