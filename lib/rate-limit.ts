export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

interface ClientRecord {
  count: number;
  resetAt: number;
}

const clientMap = new Map<string, ClientRecord>();

export function checkRateLimit(
  clientIp: string,
  limitPerMinute?: number,
  now = Date.now()
): RateLimitResult {
  const limit =
    limitPerMinute ??
    (process.env.RATE_LIMIT_PER_MINUTE
      ? parseInt(process.env.RATE_LIMIT_PER_MINUTE, 10)
      : 20);

  const windowMs = 60 * 1000;
  const ip = clientIp || "127.0.0.1";

  const record = clientMap.get(ip);

  if (!record || now >= record.resetAt) {
    clientMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetMs: windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - record.count),
    resetMs: Math.max(0, record.resetAt - now),
  };
}

export function extractClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    if (ips[0]) return ips[0];
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export function resetRateLimits(): void {
  clientMap.clear();
}
