import type { auth } from "../libs/auth";

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare global {
  namespace Express {
    interface Request {
      session?: AuthSession;
      user?: AuthSession["user"];
    }
  }
}

export {};
