import type { Request, Response } from "express";
import {
  createFormForUser,
  deleteFormForUser,
  duplicateFormForUser,
  getResponsesCsvExportForUser,
  BuilderValidationError,
  FormEditingLockedError,
  FormSettingsValidationError,
  getBuilderForUser,
  getFormAnalyticsForUser,
  getFormForUser,
  getResponseForUser,
  listFormsForUser,
  listResponsesForUser,
  saveBuilderForUser,
  updateFormForUser,
} from "./forms.service.js";
import {
  BuilderSchema,
  CreateFormSchema,
  UpdateFormSchema,
} from "@repo/validators";
import {
  getRouteParam,
  requireAuthenticatedUser,
  requireFormId,
} from "./forms.controller-helpers.js";
import {
  formCacheScope,
  getOrSetCache,
  invalidateCacheScope,
  publicFormCacheScope,
  userFormsCacheScope,
} from "../../libs/api-cache.js";

export function getFormId(req: Request) {
  return getRouteParam(req, "id");
}

function getUserId(req: Request) {
  return req.user?.id;
}

export async function createForm(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;

  const parsed = CreateFormSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      issues: parsed.error.flatten(),
    });
  }

  const form = await createFormForUser({
    userId,
    title: parsed.data.title,
    description: parsed.data.description,
  });

  await invalidateCacheScope(userFormsCacheScope(userId));

  return res.status(201).json({ form });
}

export async function listForms(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;

  const forms = await getOrSetCache({
    scope: userFormsCacheScope(userId),
    resource: "list",
    ttlSeconds: 60 * 10,
    load: () => listFormsForUser(userId),
  });

  return res.status(200).json({ forms });
}

export async function getForm(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;
  const formId = requireFormId(req, res);
  if (!formId) return;

  const result = await getOrSetCache({
    scope: formCacheScope(formId),
    resource: `owner:${userId}:detail`,
    ttlSeconds: 60 * 10,
    load: () => getFormForUser({
      userId,
      formId,
    }),
  });

  if (!result) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(result);
}

export async function getFormAnalytics(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;
  const formId = requireFormId(req, res);
  if (!formId) return;

  const analytics = await getOrSetCache({
    scope: formCacheScope(formId),
    resource: `owner:${userId}:analytics`,
    ttlSeconds: 60 * 10,
    load: () => getFormAnalyticsForUser({ userId, formId }),
  });

  if (!analytics) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(analytics);
}

export async function listResponses(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;
  const formId = requireFormId(req, res);
  if (!formId) return;

  const result = await getOrSetCache({
    scope: formCacheScope(formId),
    resource: `owner:${userId}:responses`,
    ttlSeconds: 60 * 10,
    load: () => listResponsesForUser({ userId, formId }),
  });
  if (!result) return res.status(404).json({ error: "Form not found" });

  return res.status(200).json(result);
}

function toCsvCell(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function toExportFilename(title: string) {
  const baseName = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "form";

  return `${baseName}-responses.csv`;
}

export async function exportResponsesCsv(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;
  const formId = requireFormId(req, res);
  if (!formId) return;

  const result = await getResponsesCsvExportForUser({ userId, formId });
  if (!result) return res.status(404).json({ error: "Form not found" });

  const headers = [
    "Response ID",
    "Submitted At",
    "Completion Seconds",
    ...result.questions.map((question, index) => `Question ${index + 1}: ${question.title}`),
  ];

  const rows = result.responses.map((response) => {
    const answersByQuestionId = new Map(
      response.answers.map((answer) => [answer.questionId, answer.answer]),
    );

    return [
      response.id,
      response.submittedAt.toISOString(),
      response.completionMs === null
        ? ""
        : (response.completionMs / 1000).toFixed(2),
      ...result.questions.map((question) => answersByQuestionId.get(question.id) ?? ""),
    ];
  });

  const csv = `\uFEFF${[headers, ...rows]
    .map((row) => row.map(toCsvCell).join(","))
    .join("\r\n")}\r\n`;

  res
    .status(200)
    .type("text/csv")
    .setHeader("Content-Disposition", `attachment; filename="${toExportFilename(result.form.title)}"`)
    .send(csv);
}

export async function getResponse(req: Request, res: Response) {
  const userId = requireAuthenticatedUser(req, res);
  if (!userId) return;
  const formId = requireFormId(req, res);
  const responseId = getRouteParam(req, "responseId");

  if (!formId || !responseId) {
    return res.status(400).json({ error: "Invalid response id" });
  }

  const result = await getOrSetCache({
    scope: formCacheScope(formId),
    resource: `owner:${userId}:response:${responseId}`,
    ttlSeconds: 60 * 10,
    load: () => getResponseForUser({
      userId,
      formId,
      responseId,
    }),
  });
  if (!result) return res.status(404).json({ error: "Response not found" });

  return res.status(200).json(result);
}

export async function updateForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const parsed = UpdateFormSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      issues: parsed.error.flatten(),
    });
  }

  let form;
  try {
    form = await updateFormForUser({
      userId,
      formId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      opensAt: parsed.data.opensAt,
      expiresAt: parsed.data.expiresAt,
      responseLimit: parsed.data.responseLimit,
      acceptMultipleResponses: parsed.data.acceptMultipleResponses,
    });
  } catch (error) {
    if (error instanceof FormEditingLockedError) {
      return res.status(409).json({ error: error.message });
    }
    if (error instanceof FormSettingsValidationError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }

  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

  await Promise.all([
    invalidateCacheScope(userFormsCacheScope(userId)),
    invalidateCacheScope(formCacheScope(form.id)),
    invalidateCacheScope(publicFormCacheScope(form.publicId)),
  ]);

  return res.status(200).json({ form });
}

export async function deleteForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const deletedForm = await deleteFormForUser({
    userId,
    formId,
  });

  if (!deletedForm) {
    return res.status(404).json({ error: "Form not found" });
  }

  await Promise.all([
    invalidateCacheScope(userFormsCacheScope(userId)),
    invalidateCacheScope(formCacheScope(deletedForm.id)),
    invalidateCacheScope(publicFormCacheScope(deletedForm.publicId)),
  ]);

  return res.status(200).json({ success: true });
}

export async function duplicateForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const form = await duplicateFormForUser({
    userId,
    formId,
  });

  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

  await invalidateCacheScope(userFormsCacheScope(userId));

  return res.status(201).json({ form });
}

export async function getBuilder(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const builder = await getOrSetCache({
    scope: formCacheScope(formId),
    resource: `owner:${userId}:builder`,
    ttlSeconds: 60 * 10,
    load: () => getBuilderForUser({
      userId,
      formId,
    }),
  });

  if (!builder) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(builder);
}

export async function saveBuilder(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const parsed = BuilderSchema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid builder payload",
      issues: parsed.error.flatten(),
    });
  }

  let builder;
  try {
    builder = await saveBuilderForUser({
      userId,
      formId,
      builder: parsed.data,
    });
  } catch (error) {
    if (error instanceof FormEditingLockedError) {
      return res.status(409).json({ error: error.message });
    }
    if (error instanceof BuilderValidationError) {
      return res.status(400).json({
        error: "Invalid builder graph",
        message: error.message,
      });
    }

    throw error;
  }

  if (!builder) {
    return res.status(404).json({ error: "Form not found" });
  }

  await invalidateCacheScope(formCacheScope(formId));

  return res.status(200).json(builder);
}
