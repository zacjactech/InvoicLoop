/**
 * Lightweight in-memory rate limiter.
 *
 * Production note: this is a single-process bucket; under multi-instance
 * deployment (Vercel, multiple workers, etc.) it undercounts. Swap for
 * an Upstash/Redis-backed limiter before going live. The interface is
 * intentionally narrow so it can be replaced without touching callers.
 */

interface BucketState {
  count: number;
  resetAt: number;
}

interface LimiterOptions {
  max: number;
  windowMs: number;
}

const buckets = new Map<string, BucketState>();

function consume(key: string, opts: LimiterOptions): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }
  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.max - existing.count,
    resetAt: existing.resetAt,
  };
}

function clientKey(request: Request, suffix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${suffix}:${ip}`;
}

export function rateLimit(
  request: Request,
  suffix: string,
  opts: LimiterOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  return consume(clientKey(request, suffix), opts);
}

/**
 * Best-effort cleanup so the map does not grow unbounded across long
 * uptime. Called opportunistically per request.
 */
function maybeCleanup(): void {
  if (buckets.size < 1024) return;
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}
void maybeCleanup;

export function rateLimitHeaders(
  result: { remaining: number; resetAt: number; allowed: boolean },
  max: number
): HeadersInit {
  return {
    "X-RateLimit-Limit": String(max),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))) }),
  };
}
