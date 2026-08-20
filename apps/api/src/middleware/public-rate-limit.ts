import type { NextFunction, Request, Response } from "express";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { logger } from "@repo/logger";
import { redis } from "../libs/redis.js";
import { getRequestIpFingerprint } from "../libs/request-fingerprint.js";

const publicFormReadLimiter = redis
  ? new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: "blueprint:public-form-read",
      points: 30,
      duration: 60,
      blockDuration: 60,
      rejectIfRedisNotReady: true,
    })
  : null;

const publicFormSubmissionLimiter = redis
  ? new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: "blueprint:public-form-submit",
      points: 5,
      duration: 600,
      blockDuration: 600,
      rejectIfRedisNotReady: true,
    })
  : null;

function getPublicId(req: Request) {
  const { publicId } = req.params;
  return Array.isArray(publicId) ? publicId[0] : publicId;
}

function applyRateLimit(limiter: RateLimiterRedis | null, route: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!limiter) return next();

    const publicId = getPublicId(req);
    if (!publicId) return next();

    const key = `${publicId}:${getRequestIpFingerprint(req)}`;

    try {
      await limiter.consume(key);
      return next();
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil(error.msBeforeNext / 1_000),
        );

        res.set("Retry-After", String(retryAfterSeconds));
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
        });
      }

      logger.warn(
        { err: error, route, publicId },
        "Rate limiter unavailable; allowing request",
      );
      return next();
    }
  };
}

export const rateLimitPublicFormRead = applyRateLimit(
  publicFormReadLimiter,
  "public-form-read",
);

export const rateLimitPublicFormSubmission = applyRateLimit(
  publicFormSubmissionLimiter,
  "public-form-submit",
);
