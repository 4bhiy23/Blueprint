import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // In production this is the Vercel app URL. Next.js proxies only /api/auth
  // to Render, so Better Auth cookies stay first-party in the browser.
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? process.env.NEXT_PUBLIC_API_URL,
});
