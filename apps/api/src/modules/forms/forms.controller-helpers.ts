import type { Request, Response } from "express";

export function requireAuthenticatedUser(req: Request, res: Response): string | null {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  return userId;
}

export function getRouteParam(req: Request, name: string): string | undefined {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export function requireFormId(req: Request, res: Response): string | null {
  const formId = getRouteParam(req, "id");
  if (!formId) {
    res.status(400).json({ error: "Invalid form id" });
    return null;
  }

  return formId;
}
