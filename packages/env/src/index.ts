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
  BETTER_AUTH_URL: z.string()
});

export const apiEnv = apiEnvSchema.parse(process.env);
