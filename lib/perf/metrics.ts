/**
 * Development-only in-memory performance metrics.
 *
 * Deliberately dependency-free: no OpenTelemetry, no external service, no new
 * infrastructure. Only aggregate durations/counts are kept, never SQL text,
 * arguments, cache keys with user ids, or customer data.
 *
 * Imported by proxy.ts as well as Node server modules, so it must stay
 * runtime-agnostic (no Node-only APIs).
 */

type Bucket = { count: number; totalMs: number; maxMs: number };
type Sample = { name: string; ms: number };
type CacheBucket = { hits: number; misses: number };

type MetricsState = {
  startedAt: number;
  requests: { total: number; byKind: Record<string, number> };
  serverActions: {
    count: number;
    totalMs: number;
    maxMs: number;
    byName: Record<string, Bucket>;
    slowest: Sample[];
  };
  prisma: {
    count: number;
    totalMs: number;
    maxMs: number;
    byOperation: Record<string, Bucket>;
    slowest: Sample[];
  };
  cache: {
    hits: number;
    misses: number;
    byNamespace: Record<string, CacheBucket>;
  };
};

const PERF_ENABLED = process.env.NODE_ENV !== "production";
const MAX_NAMED_BUCKETS = 40;
const MAX_SLOWEST = 5;

const globalForPerf = globalThis as typeof globalThis & {
  __nfPerfMetrics?: MetricsState;
};

function createState(): MetricsState {
  return {
    startedAt: Date.now(),
    requests: { total: 0, byKind: {} },
    serverActions: {
      count: 0,
      totalMs: 0,
      maxMs: 0,
      byName: {},
      slowest: [],
    },
    prisma: {
      count: 0,
      totalMs: 0,
      maxMs: 0,
      byOperation: {},
      slowest: [],
    },
    cache: {
      hits: 0,
      misses: 0,
      byNamespace: {},
    },
  };
}

export function isPerfEnabled() {
  return PERF_ENABLED;
}

function getState() {
  return (globalForPerf.__nfPerfMetrics ??= createState());
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function addBucket(
  map: Record<string, Bucket>,
  name: string,
  durationMs: number
) {
  const key =
    map[name] || Object.keys(map).length < MAX_NAMED_BUCKETS ? name : "other";
  const bucket = map[key] ?? { count: 0, totalMs: 0, maxMs: 0 };
  bucket.count += 1;
  bucket.totalMs += durationMs;
  bucket.maxMs = Math.max(bucket.maxMs, durationMs);
  map[key] = bucket;
}

function addSlowest(list: Sample[], name: string, durationMs: number) {
  if (durationMs < 0.5) return;

  list.push({ name, ms: round(durationMs) });
  list.sort((left, right) => right.ms - left.ms);
  if (list.length > MAX_SLOWEST) {
    list.length = MAX_SLOWEST;
  }
}

function bucketView(bucket: Bucket) {
  return {
    count: bucket.count,
    totalMs: round(bucket.totalMs),
    avgMs: bucket.count ? round(bucket.totalMs / bucket.count) : 0,
    maxMs: round(bucket.maxMs),
  };
}

export function recordRequest(kind = "http") {
  if (!PERF_ENABLED) return;

  const state = getState();
  state.requests.total += 1;
  state.requests.byKind[kind] = (state.requests.byKind[kind] ?? 0) + 1;
}

export function recordServerAction(name: string, durationMs: number) {
  if (!PERF_ENABLED) return;

  const state = getState();
  state.requests.total += 1;
  state.requests.byKind["server-action"] =
    (state.requests.byKind["server-action"] ?? 0) + 1;

  state.serverActions.count += 1;
  state.serverActions.totalMs += durationMs;
  state.serverActions.maxMs = Math.max(
    state.serverActions.maxMs,
    durationMs
  );
  addBucket(state.serverActions.byName, name, durationMs);
  addSlowest(state.serverActions.slowest, name, durationMs);
}

export function recordPrismaQuery(operation: string, durationMs: number) {
  if (!PERF_ENABLED) return;

  const state = getState();
  state.prisma.count += 1;
  state.prisma.totalMs += durationMs;
  state.prisma.maxMs = Math.max(state.prisma.maxMs, durationMs);
  addBucket(state.prisma.byOperation, operation, durationMs);
  addSlowest(state.prisma.slowest, operation, durationMs);
}

export function recordCacheLookup(namespace: string, hit: boolean) {
  if (!PERF_ENABLED) return;

  const state = getState();
  if (hit) {
    state.cache.hits += 1;
  } else {
    state.cache.misses += 1;
  }

  const key =
    state.cache.byNamespace[namespace] ||
    Object.keys(state.cache.byNamespace).length < MAX_NAMED_BUCKETS
      ? namespace
      : "other";
  const bucket = state.cache.byNamespace[key] ?? { hits: 0, misses: 0 };
  if (hit) {
    bucket.hits += 1;
  } else {
    bucket.misses += 1;
  }
  state.cache.byNamespace[key] = bucket;
}

export function resetPerfMetrics() {
  globalForPerf.__nfPerfMetrics = createState();
}

export function getPerfSnapshot() {
  const state = getState();
  const cacheReads = state.cache.hits + state.cache.misses;

  return {
    enabled: PERF_ENABLED,
    startedAt: new Date(state.startedAt).toISOString(),
    uptimeMs: Date.now() - state.startedAt,
    requests: {
      total: state.requests.total,
      byKind: { ...state.requests.byKind },
    },
    serverActions: {
      count: state.serverActions.count,
      totalMs: round(state.serverActions.totalMs),
      avgMs: state.serverActions.count
        ? round(state.serverActions.totalMs / state.serverActions.count)
        : 0,
      maxMs: round(state.serverActions.maxMs),
      byName: Object.fromEntries(
        Object.entries(state.serverActions.byName).map(([name, bucket]) => [
          name,
          bucketView(bucket),
        ])
      ),
      slowest: state.serverActions.slowest.map((sample) => ({ ...sample })),
    },
    prisma: {
      count: state.prisma.count,
      totalMs: round(state.prisma.totalMs),
      avgMs: state.prisma.count
        ? round(state.prisma.totalMs / state.prisma.count)
        : 0,
      maxMs: round(state.prisma.maxMs),
      byOperation: Object.fromEntries(
        Object.entries(state.prisma.byOperation).map(([name, bucket]) => [
          name,
          bucketView(bucket),
        ])
      ),
      slowest: state.prisma.slowest.map((sample) => ({ ...sample })),
    },
    cache: {
      hits: state.cache.hits,
      misses: state.cache.misses,
      hitRatePercent: cacheReads
        ? round((state.cache.hits / cacheReads) * 100)
        : 0,
      byNamespace: Object.fromEntries(
        Object.entries(state.cache.byNamespace).map(([namespace, bucket]) => [
          namespace,
          {
            hits: bucket.hits,
            misses: bucket.misses,
            hitRatePercent:
              bucket.hits + bucket.misses
                ? round(
                    (bucket.hits / (bucket.hits + bucket.misses)) * 100
                  )
                : 0,
          },
        ])
      ),
    },
  };
}
