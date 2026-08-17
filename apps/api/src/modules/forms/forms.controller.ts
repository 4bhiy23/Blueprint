import type { Request, Response } from "express";
import {
  createFormForUser,
  deleteFormForUser,
  duplicateFormForUser,
  getResponsesCsvExportForUser,
  BuilderValidationError,
  FormEditingLockedError,
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

function getUserId(req: Request) {
  return req.user?.id;
}

export function getFormId(req: Request) {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

export async function createForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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

  return res.status(201).json({ form });
}

export async function listForms(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const forms = await listFormsForUser(userId);

  return res.status(200).json({ forms });
}

export async function getForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const result = await getFormForUser({
    userId,
    formId,
  });

  if (!result) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(result);
}

export async function getFormAnalytics(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const formId = getFormId(req);

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  const analytics = await getFormAnalyticsForUser({ userId, formId });

  if (!analytics) {
    return res.status(404).json({ error: "Form not found" });
  }

  return res.status(200).json(analytics);
}

export async function listResponses(req: Request, res: Response) {
  const userId = getUserId(req);
  const formId = getFormId(req);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!formId) return res.status(400).json({ error: "Invalid form id" });

  const result = await listResponsesForUser({ userId, formId });
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
  const userId = getUserId(req);
  const formId = getFormId(req);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!formId) return res.status(400).json({ error: "Invalid form id" });

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
  const userId = getUserId(req);
  const formId = getFormId(req);
  const { responseId } = req.params;
  const normalizedResponseId = Array.isArray(responseId) ? responseId[0] : responseId;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!formId || !normalizedResponseId) {
    return res.status(400).json({ error: "Invalid response id" });
  }

  const result = await getResponseForUser({
    userId,
    formId,
    responseId: normalizedResponseId,
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
    });
  } catch (error) {
    if (error instanceof FormEditingLockedError) {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }

  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

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

  const deleted = await deleteFormForUser({
    userId,
    formId,
  });

  if (!deleted) {
    return res.status(404).json({ error: "Form not found" });
  }

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

  const builder = await getBuilderForUser({
    userId,
    formId,
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

  return res.status(200).json(builder);
}
