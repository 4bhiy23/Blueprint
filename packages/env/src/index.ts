import { z } from "zod";

const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),

  PORT: z.coerce.number().default(4000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  FRONTEND_URL: z.string().url(),

  REDIS_URL: z.string().url().optional(),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
}).refine(
  (env) => Boolean(env.GOOGLE_CLIENT_ID) === Boolean(env.GOOGLE_CLIENT_SECRET),
  {
    message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together.",
    path: ["GOOGLE_CLIENT_ID"],
  },
);

export const apiEnv = apiEnvSchema.parse(process.env);
