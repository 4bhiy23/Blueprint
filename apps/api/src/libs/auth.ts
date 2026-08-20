import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import { apiEnv } from "@repo/env";

export const auth = betterAuth({
  baseURL: apiEnv.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  ...(apiEnv.GOOGLE_CLIENT_ID && apiEnv.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: apiEnv.GOOGLE_CLIENT_ID,
            clientSecret: apiEnv.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  trustedOrigins: [apiEnv.FRONTEND_URL],
});
