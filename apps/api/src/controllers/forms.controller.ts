import type { Request, Response } from "express";
import {
  createFormForUser,
  deleteFormForUser,
  duplicateFormForUser,
  BuilderValidationError,
  getBuilderForUser,
  getFormForUser,
  listFormsForUser,
  saveBuilderForUser,
  updateFormForUser,
} from "../services/forms.service.js";
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

  const form = await updateFormForUser({
    userId,
    formId,
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
  });

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

  try {
    const builder = await saveBuilderForUser({
      userId,
      formId,
      builder: parsed.data,
    });

    if (!builder) {
      return res.status(404).json({ error: "Form not found" });
    }

    return res.status(200).json(builder);
  } catch (error) {
    if (error instanceof BuilderValidationError) {
      return res.status(400).json({
        error: "Invalid builder graph",
        message: error.message,
      });
    }

    throw error;
  }
}
