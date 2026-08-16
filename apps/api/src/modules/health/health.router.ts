import { db, sql } from "@repo/db";
import { logger } from "@repo/logger";
import { Router } from "express";

const router = Router();
const startedAt = Date.now();

function serviceDetails() {
  return {
    name: "Blueprint API",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1_000),
    timestamp: new Date().toISOString(),
  };
}

router.get("/live", (_req, res) => {
  res.status(200).json({
    status: "ok",
    ...serviceDetails(),
  });
});

router.get("/", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);

    return res.status(200).json({
      status: "ok",
      ...serviceDetails(),
      checks: { database: "ok" },
    });
  } catch (error) {
    logger.error({ err: error }, "Health check database query failed");

    return res.status(503).json({
      status: "degraded",
      ...serviceDetails(),
      checks: { database: "unavailable" },
    });
  }
});

export default router;
