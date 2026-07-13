import type { Request, Response, NextFunction } from "express";
import { auth } from "../libs/auth";

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

function toHeadersInit(headers: Request["headers"]) {
  const normalized = new Headers();

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      normalized.set(key, value);
    } else if (Array.isArray(value)) {
      normalized.set(key, value.join(","));
    }
  }

  return normalized;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: toHeadersInit(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.session = session as AuthSession;
    req.user = session.user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Auth check failed" });
  }
}
