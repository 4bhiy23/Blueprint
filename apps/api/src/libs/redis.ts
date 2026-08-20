import Redis from "ioredis";
import { apiEnv } from "@repo/env";
import { logger } from "@repo/logger";

export const redis = apiEnv.REDIS_URL
  ? new Redis(apiEnv.REDIS_URL, {
      enableOfflineQueue: false,
    })
  : null;

redis?.on("error", (error) => {
  logger.error({ err: error }, "Redis connection error");
});
