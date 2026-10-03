import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: new URL("../../apps/api/.env", import.meta.url), quiet: true });
config({ quiet: true });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
