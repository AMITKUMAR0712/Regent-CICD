import "server-only";
import { LRUCache } from "lru-cache";

/**
 * Fixed-window rate limiter, in-memory.
 *
 * This process only holds state for a single Node instance. That is fine
 * for one app server; if this ever runs behind more than one instance,
 * swap the store for Redis (Upstash ratelimit or similar) behind this same
 * `checkRateLimit` signature — nothing that calls it needs to change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new LRUCache<string, Bucket>({
  max: 50_000,
  ttl: 60 * 60 * 1000, // buckets never need to live longer than the largest window we use
});

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt }, { ttl: windowMs });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Named windows for every rate-limited action in the spec (section 11). */
export const RATE_LIMITS = {
  otpRequest: { limit: 3, windowMs: 10 * 60 * 1000 }, // 3 per 10 min
  login: { limit: 8, windowMs: 15 * 60 * 1000 }, // 8 per 15 min
  registration: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  partyRequestCreate: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
} as const;

/** Builds a composite key so the same limiter can be scoped per email, phone or IP. */
export function rateLimitKey(scope: keyof typeof RATE_LIMITS, identifier: string): string {
  return `${scope}:${identifier}`;
}
