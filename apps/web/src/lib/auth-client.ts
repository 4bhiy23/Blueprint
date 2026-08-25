import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // Production auth is served directly by api.blueprint.4bhi.dev. Better Auth
  // shares the secure session cookie with the Blueprint web subdomain.
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.NEXT_PUBLIC_API_URL,
});
