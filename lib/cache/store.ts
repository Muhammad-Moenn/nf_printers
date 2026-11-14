import "server-only";

import { getCacheBackend } from "@/lib/redis";

const LOCK_TTL_MS = 5_000;
const LOCK_WAIT_INTERVAL_MS = 100;
const LOCK_WAIT_ATTEMPTS = 20;
const TTL_JITTER_RATIO = 0.1;

const inFlight = new Map<string, Promise<unknown>>();

let lastErrorLogAt = 0;
let lastErrorMessage = "";

/**
 * Next.js signals dynamic rendering by throwing. The cache layer must never
 * swallow that control-flow error, only genuine Redis failures.
 */
function isFrameworkControlFlow(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    ((error as { digest: string }).digest === "DYNAMIC_SERVER_USAGE" ||
      (error as { digest: string }).digest.startsWith("NEXT_"))
  );
}

function reportCacheError(operation: string, error: unknown) {
  if (isFrameworkControlFlow(error)) throw error;

  const message =
    error instanceof Error
      ? [error.name, error.message].filter(Boolean).join(": ")
      : String(error);
  const now = Date.now();

  if (message === lastErrorMessage && now - lastErrorLogAt < 30_000) {
    return;
  }

  lastErrorLogAt = now;
  lastErrorMessage = message;
  console.error(`[cache] ${operation} failed:`, message);
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function jitteredTtl(ttlSeconds: number) {
  const jitter = ttlSeconds * TTL_JITTER_RATIO * (Math.random() * 2 - 1);
  return Math.max(1, Math.round(ttlSeconds + jitter));
}

/**
 * Cached values are JSON, so `Date` instances become ISO strings. Loader
 * results are normalized the same way to keep cache hits and misses identical.
 */
function normalizeForCache<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return null;

  try {
    const raw = await backend.get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    reportCacheError("get", error);
    return null;
  }
}

export async function cacheIncr(
  key: string,
  ttlSeconds: number
): Promise<number | null> {
  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return null;

  try {
    const value = await backend.incr(key);
    await backend.expire(key, ttlSeconds);
    return value;
  } catch (error) {
    reportCacheError("incr", error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return;

  try {
    await backend.set(key, JSON.stringify(value), jitteredTtl(ttlSeconds));
  } catch (error) {
    reportCacheError("set", error);
  }
}

export async function cacheDelete(key: string | string[]): Promise<void> {
  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return;

  const keys = Array.isArray(key) ? key : [key];
  if (!keys.length) return;

  try {
    await backend.del(keys);
  } catch (error) {
    reportCacheError("delete", error);
  }
}

async function runGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return normalizeForCache(await loader());

  const lockKey = `${key}:lock`;
  const token = `${process.pid}:${Date.now()}:${Math.random()
    .toString(36)
    .slice(2)}`;

  let acquired = false;
  let lockFailed = false;

  try {
    acquired = await backend.acquireLock(lockKey, token, LOCK_TTL_MS);
  } catch (error) {
    lockFailed = true;
    reportCacheError("lock", error);
  }

  // If the cache backend errored, do not wait on a lock that may not exist.
  if (lockFailed) return normalizeForCache(await loader());

  if (!acquired) {
    for (let attempt = 0; attempt < LOCK_WAIT_ATTEMPTS; attempt += 1) {
      await sleep(LOCK_WAIT_INTERVAL_MS);
      const cached = await cacheGet<T>(key);
      if (cached !== null) return cached;
    }

    return normalizeForCache(await loader());
  }

  try {
    const cachedAfterLock = await cacheGet<T>(key);
    if (cachedAfterLock !== null) return cachedAfterLock;

    const value = normalizeForCache(await loader());
    await cacheSet(key, value, ttlSeconds);
    return value;
  } finally {
    try {
      await backend.releaseLock(lockKey, token);
    } catch (error) {
      reportCacheError("unlock", error);
    }
  }
}

/**
 * Cache-aside helper with in-process request coalescing and a Redis lock to
 * avoid a stampede when an expensive value expires. Cache failures always fall
 * back to the loader instead of failing the request.
 */
export function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = runGetOrSet(key, ttlSeconds, loader).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
}

/**
 * Variant of {@link getOrSet} for keys that embed a version counter. The
 * counter and the versioned entry are read in one EVAL round trip, so a hit
 * costs one round trip instead of two. A miss falls through to the normal
 * lock-protected path for the key built from the observed version.
 */
export async function getOrSetVersioned<T>(
  versionKey: string,
  keyPrefix: string,
  keySuffix: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const backend = getCacheBackend();
  if (!backend || !backend.isReady()) return normalizeForCache(await loader());

  let version = 0;

  try {
    const result = await backend.getVersioned(versionKey, keyPrefix, keySuffix);
    version = result.version;

    if (result.value !== null) {
      try {
        return JSON.parse(result.value) as T;
      } catch (error) {
        reportCacheError("getVersioned", error);
      }
    }
  } catch (error) {
    reportCacheError("getVersioned", error);
    return normalizeForCache(await loader());
  }

  return runGetOrSet(`${keyPrefix}${version}:${keySuffix}`, ttlSeconds, loader);
}
