import { z } from "zod";

const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),

  PORT: z.coerce.number().default(4000),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const apiEnv = apiEnvSchema.parse(process.env);
