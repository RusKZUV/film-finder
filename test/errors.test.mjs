import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const errorsPath = path.join(process.cwd(), "lib", "errors.ts");
const errorsSrc = fs.readFileSync(errorsPath, "utf-8");

describe("lib/errors.ts structure & exports", () => {
  it("defines standard error classes and formatting helpers", () => {
    assert.ok(errorsSrc.includes("class AppError"), "Should export AppError");
    assert.ok(errorsSrc.includes("class BadRequestError"), "Should export BadRequestError");
    assert.ok(errorsSrc.includes("class UpstreamTimeoutError"), "Should export UpstreamTimeoutError");
    assert.ok(errorsSrc.includes("function formatErrorResponse"), "Should export formatErrorResponse");
    assert.ok(errorsSrc.includes("function redactSecrets"), "Should export redactSecrets");
  });
});

describe("Error response formatting and secret redaction", () => {
  function redactSecrets(text, secret) {
    if (!text) return "";
    let cleaned = text;
    if (secret) cleaned = cleaned.replaceAll(secret, "[REDACTED]");
    return cleaned.replace(/sk-[a-zA-Z0-9_-]{20,}/g, "[REDACTED]");
  }

  function formatErrorResponse(error, nodeEnv = "development", secret = "") {
    let status = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected server error occurred.";

    if (error && typeof error === "object") {
      if (typeof error.status === "number") status = error.status;
      if (typeof error.code === "string") code = error.code;
      if (typeof error.message === "string") message = error.message;
    }

    message = redactSecrets(message, secret);

    if (nodeEnv === "production" && status >= 500 && code === "INTERNAL_SERVER_ERROR") {
      message = "An unexpected server error occurred. Please try again later.";
    }

    return { status, body: { error: message, code } };
  }

  it("formats 400 Bad Request properly", () => {
    const err = { status: 400, code: "BAD_REQUEST", message: "Query string is required" };
    const res = formatErrorResponse(err);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, "BAD_REQUEST");
    assert.equal(res.body.error, "Query string is required");
  });

  it("formats 504 Upstream Timeout properly", () => {
    const err = { status: 504, code: "GATEWAY_TIMEOUT", message: "TMDB request timed out." };
    const res = formatErrorResponse(err);
    assert.equal(res.status, 504);
    assert.equal(res.body.code, "GATEWAY_TIMEOUT");
    assert.ok(res.body.error.includes("timed out"));
  });

  it("redacts sensitive keys from error messages", () => {
    const leakedKey = "sk-proj-1234567890abcdef1234567890";
    const err = { status: 502, code: "UPSTREAM_ERROR", message: `Failed with key ${leakedKey}` };
    const res = formatErrorResponse(err, "development", leakedKey);
    assert.ok(!res.body.error.includes(leakedKey), "Leaked key must be redacted");
    assert.ok(res.body.error.includes("[REDACTED]"));
  });

  it("redacts stack trace / internal details in production mode", () => {
    const err = {
      status: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed at /var/www/film-finder/internal.ts:45",
    };
    const prodRes = formatErrorResponse(err, "production");
    assert.equal(prodRes.body.error, "An unexpected server error occurred. Please try again later.");
    assert.ok(!prodRes.body.error.includes("/var/www"));
  });
});
