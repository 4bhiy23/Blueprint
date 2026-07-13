import type { Request, Response } from "express";
import {
  createFormForUser,
  deleteFormForUser,
  duplicateFormForUser,
  getFormForUser,
  listFormsForUser,
  updateFormForUser,
} from "../services/forms.service.js";

function getUserId(req: Request) {
  return req.user?.id;
}

function getFormId(req: Request) {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] : id;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

export async function createForm(req: Request, res: Response) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { title, description } = req.body ?? {};

  if (!isOptionalString(title) || !isOptionalString(description)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const form = await createFormForUser({
    userId,
    title,
    description,
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
  const { title, description } = req.body ?? {};

  if (!formId) {
    return res.status(400).json({ error: "Invalid form id" });
  }

  if (!isOptionalString(title) || !isOptionalString(description)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const form = await updateFormForUser({
    userId,
    formId,
    title,
    description,
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
