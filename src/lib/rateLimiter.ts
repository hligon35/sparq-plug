/**
 * Abstraction layer for rate limiting to allow future Redis / external store swap.
 */
export interface RateLimiter {
  check(key: string, opts: { windowMs: number; max: number }): { allowed: boolean; remaining: number };
  key(parts: { ip?: string; tenantId?: string; path?: string }): string;
}

class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, number[]>();
  check(key: string, opts: { windowMs: number; max: number }) {
    const now = Date.now();
    let arr = this.buckets.get(key);
    if (!arr) { arr = []; this.buckets.set(key, arr); }
    const cutoff = now - opts.windowMs;
    let i = 0; while (i < arr.length && arr[i] < cutoff) i++; if (i) arr.splice(0, i);
    if (arr.length >= opts.max) return { allowed: false, remaining: 0 };
    arr.push(now);
    return { allowed: true, remaining: Math.max(0, opts.max - arr.length) };
  }
  key(parts: { ip?: string; tenantId?: string; path?: string }) {
    return [parts.tenantId || 'default', parts.ip || 'unknown', parts.path || 'unknown'].join('::');
  }
}

export const rateLimiter: RateLimiter = new InMemoryRateLimiter();

// Future: export a factory that picks Redis-based implementation if REDIS_URL present.