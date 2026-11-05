/**
 * Small in-process sliding-window rate limiter.
 *
 * This is intentionally dependency-free. It is scoped to a single server
 * instance, so a multi-instance/serverless deployment should replace the store
 * with a shared backend (Redis/Upstash or a database table) for strict global
 * limits. It still stops single-instance abuse, accidental request storms and
 * repeated form submissions.
 */

type Bucket = { count: number; resetAt: number };

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

const globalForRateLimit = globalThis as unknown as {
  __nfRateLimitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalForRateLimit.__nfRateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__nfRateLimitBuckets = buckets;

const MAX_BUCKETS = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

function sweep(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS && buckets.size < MAX_BUCKETS) {
    return;
  }

  lastSweepAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  // Keep memory bounded even if every entry is still active.
  if (buckets.size > MAX_BUCKETS) {
    const excess = buckets.size - MAX_BUCKETS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
