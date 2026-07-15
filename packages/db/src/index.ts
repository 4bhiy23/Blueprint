import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from './schema/index.js'

const sql = neon(process.env.DATABASE_URL as string);

export const db = drizzle(sql,{
    schema
});

export { and, eq, sql, gt } from "drizzle-orm";
export * from "./schema/index.js";
