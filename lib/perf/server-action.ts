import "server-only";

import { isPerfEnabled, recordServerAction } from "@/lib/perf/metrics";

/**
 * Wraps a server action with dev-only duration/count instrumentation.
 * In production the original function is returned unchanged.
 */
export function withServerActionTiming<Args extends unknown[], Result>(
  name: string,
  action: (...args: Args) => Promise<Result>
): (...args: Args) => Promise<Result> {
  if (!isPerfEnabled()) {
    return action;
  }

  return async (...args: Args) => {
    const startedAt = performance.now();
    try {
      return await action(...args);
    } finally {
      recordServerAction(name, performance.now() - startedAt);
    }
  };
}
