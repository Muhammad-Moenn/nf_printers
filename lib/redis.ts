import "server-only";

import { Redis } from "@upstash/redis";

/**
 * Cache backend abstraction over the Upstash REST API.
 *
 * Credentials come from `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN`. When they are missing or invalid, callers fall
 * back to the database and cache failures never fail a request.
 */
export interface CacheBackend {
  isReady(): boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(keys: string[]): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  acquireLock(key: string, token: string, ttlMs: number): Promise<boolean>;
  releaseLock(key: string, token: string): Promise<void>;
  /**
   * Reads a version counter and the entry keyed by it in a single round trip.
   * The page key is `<keyPrefix><version>:<keySuffix>`.
   */
  getVersioned(
    versionKey: string,
    keyPrefix: string,
    keySuffix: string
  ): Promise<{ version: number; value: string | null }>;
}

const RELEASE_LOCK_SCRIPT =
  "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

const GET_VERSIONED_SCRIPT =
  "local version = redis.call('get', KEYS[1]) or '0' " +
  "local value = redis.call('get', ARGV[1] .. version .. ':' .. ARGV[2]) " +
  "return {version, value or ''}";

const globalForCache = globalThis as unknown as {
  __nfRedisClient?: Redis | null;
  __nfCacheBackend?: CacheBackend | null;
};

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    return null;
  }

  if (!url.startsWith("https://")) {
    console.error("[cache] UPSTASH_REDIS_REST_URL must be an https URL.");
    return null;
  }

  try {
    return new Redis({
      url,
      token,
      // Values are encoded explicitly by the cache store, so keep the raw
      // string instead of letting the SDK parse JSON on read.
      automaticDeserialization: false,
      enableTelemetry: false,
      // Never let Next.js cache Redis REST calls.
      cache: "no-store",
    });
  } catch {
    console.error("[cache] Unable to initialize the Upstash Redis client.");
    return null;
  }
}

export function getRedisClient(): Redis | null {
  if (globalForCache.__nfRedisClient !== undefined) {
    return globalForCache.__nfRedisClient;
  }

  const client = createRedisClient();
  globalForCache.__nfRedisClient = client;
  return client;
}

export function getCacheBackend(): CacheBackend | null {
  if (globalForCache.__nfCacheBackend !== undefined) {
    return globalForCache.__nfCacheBackend;
  }

  const client = getRedisClient();
  if (!client) {
    globalForCache.__nfCacheBackend = null;
    return null;
  }

  const backend: CacheBackend = {
    isReady: () => true,
    get: async (key) => {
      const value = await client.get<string>(key);
      return value ?? null;
    },
    set: async (key, value, ttlSeconds) => {
      await client.set(key, value, {
        ex: Math.max(1, Math.round(ttlSeconds)),
      });
    },
    del: async (keys) => {
      if (keys.length) {
        await client.del(...keys);
      }
    },
    incr: (key) => client.incr(key),
    expire: async (key, ttlSeconds) => {
      await client.expire(key, Math.max(1, Math.round(ttlSeconds)));
    },
    acquireLock: async (key, lockToken, ttlMs) => {
      const result = await client.set(key, lockToken, {
        nx: true,
        px: Math.max(1, Math.round(ttlMs)),
      });
      return result === "OK";
    },
    releaseLock: async (key, lockToken) => {
      await client.eval(RELEASE_LOCK_SCRIPT, [key], [lockToken]);
    },
    getVersioned: async (versionKey, keyPrefix, keySuffix) => {
      // `eval` takes the script args as the first generic and the result type
      // as the second. The Lua script always returns the two-element table
      // `{ version, value }`.
      const result = await client.eval<
        unknown[],
        [string | number | null, string | number | null]
      >(GET_VERSIONED_SCRIPT, [versionKey], [keyPrefix, keySuffix]);

      const version = Number(result?.[0] ?? 0) || 0;
      const value = result?.[1];

      return {
        version,
        value: typeof value === "string" && value.length > 0 ? value : null,
      };
    },
  };

  globalForCache.__nfCacheBackend = backend;
  return backend;
}
