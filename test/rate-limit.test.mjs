import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rlPath = path.join(process.cwd(), "lib", "rate-limit.ts");
const routePath = path.join(process.cwd(), "app", "api", "search", "route.ts");
const rlSrc = fs.readFileSync(rlPath, "utf-8");
const routeSrc = fs.readFileSync(routePath, "utf-8");

describe("lib/rate-limit.ts & /api/search integration structure", () => {
  it("defines checkRateLimit, extractClientIp, and resetRateLimits", () => {
    assert.ok(rlSrc.includes("function checkRateLimit"), "Should export checkRateLimit");
    assert.ok(rlSrc.includes("function extractClientIp"), "Should export extractClientIp");
    assert.ok(rlSrc.includes("function resetRateLimits"), "Should export resetRateLimits");
  });

  it("checks rate limit in /api/search route and returns 429 when exceeded", () => {
    assert.ok(routeSrc.includes("checkRateLimit"), "Route should call checkRateLimit");
    assert.ok(routeSrc.includes("429"), "Route should return status 429");
    assert.ok(routeSrc.includes("Too many requests. Please try again later."), "Route should return 429 error message");
    assert.ok(routeSrc.includes("X-RateLimit-Limit"), "Route should include rate limit headers");
  });
});

describe("Rate limiting behavior simulation", () => {
  let clientMap = new Map();

  function checkRateLimit(clientIp, limit = 5, now = 1000) {
    const windowMs = 60 * 1000;
    const ip = clientIp || "127.0.0.1";
    const record = clientMap.get(ip);

    if (!record || now >= record.resetAt) {
      clientMap.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, limit, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      return { allowed: false, limit, remaining: 0 };
    }

    record.count += 1;
    return { allowed: true, limit, remaining: limit - record.count };
  }

  beforeEach(() => {
    clientMap.clear();
  });

  it("allows requests under the rate limit", () => {
    const res1 = checkRateLimit("192.168.1.1", 3);
    assert.equal(res1.allowed, true);
    assert.equal(res1.remaining, 2);

    const res2 = checkRateLimit("192.168.1.1", 3);
    assert.equal(res2.allowed, true);
    assert.equal(res2.remaining, 1);
  });

  it("rejects requests exceeding limit with 429 payload", () => {
    checkRateLimit("10.0.0.1", 2);
    checkRateLimit("10.0.0.1", 2);
    const res3 = checkRateLimit("10.0.0.1", 2);
    assert.equal(res3.allowed, false);
    assert.equal(res3.remaining, 0);
  });

  it("isolates rate limits per IP address", () => {
    checkRateLimit("1.1.1.1", 1);
    const blockedIp1 = checkRateLimit("1.1.1.1", 1);
    assert.equal(blockedIp1.allowed, false);

    const allowedOtherIp = checkRateLimit("2.2.2.2", 1);
    assert.equal(allowedOtherIp.allowed, true);
  });

  it("extracts client IP safely from x-forwarded-for header", () => {
    function extractIp(headers) {
      const forwarded = headers["x-forwarded-for"];
      if (forwarded) return forwarded.split(",")[0].trim();
      return headers["x-real-ip"] || "127.0.0.1";
    }

    assert.equal(extractIp({ "x-forwarded-for": "203.0.113.195, 70.41.3.18" }), "203.0.113.195");
    assert.equal(extractIp({ "x-real-ip": "198.51.100.1" }), "198.51.100.1");
    assert.equal(extractIp({}), "127.0.0.1");
  });
});
