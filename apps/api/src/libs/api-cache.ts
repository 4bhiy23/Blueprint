import { logger } from "@repo/logger";
import { redis } from "./redis.js";

const CACHE_PREFIX = "blueprint:cache:v1";
const VERSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function cacheVersionKey(scope: string) {
  return `${CACHE_PREFIX}:version:${scope}`;
}

function cacheDataKey(scope: string, version: string, resource: string) {
  return `${CACHE_PREFIX}:data:${scope}:${version}:${resource}`;
}

async function getCacheVersion(scope: string) {
  if (!redis) return "0";

  try {
    return (await redis.get(cacheVersionKey(scope))) ?? "0";
  } catch (error) {
    logger.warn({ err: error, scope }, "Cache version lookup failed");
    return "0";
  }
}

export async function getOrSetCache<T>(input: {
  scope: string;
  resource: string;
  ttlSeconds: number;
  load: () => Promise<T>;
  cacheNull?: boolean;
}): Promise<T> {
  if (!redis) return input.load();

  const version = await getCacheVersion(input.scope);
  const key = cacheDataKey(input.scope, version, input.resource);

  try {
    const cached = await redis.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
  } catch (error) {
    logger.warn({ err: error, scope: input.scope }, "Cache read failed");
  }

  const value = await input.load();
  if (value === null && !input.cacheNull) return value;

  try {
    await redis.set(key, JSON.stringify(value), "EX", input.ttlSeconds);
  } catch (error) {
    logger.warn({ err: error, scope: input.scope }, "Cache write failed");
  }

  return value;
}

export async function invalidateCacheScope(scope: string) {
  if (!redis) return;

  try {
    const key = cacheVersionKey(scope);
    await redis.multi().incr(key).expire(key, VERSION_TTL_SECONDS).exec();
  } catch (error) {
    logger.warn({ err: error, scope }, "Cache invalidation failed");
  }
}

export function userFormsCacheScope(userId: string) {
  return `user:${userId}:forms`;
}

export function formCacheScope(formId: string) {
  return `form:${formId}`;
}

export function publicFormCacheScope(publicId: string) {
  return `public-form:${publicId}`;
}
