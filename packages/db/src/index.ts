import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from './schema/index.js'

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });

export const db = drizzle(pool, {
    schema
});

export { and, eq, sql, gt, inArray, notInArray } from "drizzle-orm";
export * from "./schema/index.js";
