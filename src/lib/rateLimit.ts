/**
 * Simple in-memory rate limiter (sliding window) for development/testing.
 * For production, replace with a distributed store (Redis) and robust algorithm.
 */

type Stamp = number; // ms since epoch

interface Bucket {
  stamps: Stamp[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function rateLimitCheck(key: string, opts: RateLimitOptions): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { stamps: [] };
    buckets.set(key, b);
  }
  // drop old stamps
  const start = now - opts.windowMs;
  b.stamps = b.stamps.filter((s) => s > start);

  if (b.stamps.length >= opts.max) {
    return { allowed: false, remaining: 0 };
  }
  b.stamps.push(now);
  return { allowed: true, remaining: Math.max(0, opts.max - b.stamps.length) };
}

export function rateLimitHeaders(remaining: number, opts: RateLimitOptions) {
  return {
    'X-RateLimit-Limit': String(opts.max),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Window': String(opts.windowMs)
  };
}

export function rateLimitKeyFromRequest(input: { ip?: string; tenantId?: string; path?: string }) {
  return [input.tenantId || 'default', input.ip || 'unknown', input.path || 'unknown'].join('::');
}
