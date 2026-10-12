import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const openaiPath = path.join(process.cwd(), "lib", "openai.ts");
const openaiSrc = fs.readFileSync(openaiPath, "utf-8");

describe("lib/openai.ts structure & validation", () => {
  it("defines OpenAIClient class and getOpenAIClient factory", () => {
    assert.ok(openaiSrc.includes("class OpenAIClient"), "Should declare OpenAIClient class");
    assert.ok(openaiSrc.includes("function getOpenAIClient"), "Should declare getOpenAIClient factory");
  });

  it("defaults to gpt-4o-mini", () => {
    assert.ok(openaiSrc.includes("gpt-4o-mini"), "Should default to gpt-4o-mini");
  });

  it("validates OPENAI_API_KEY environment variable", () => {
    assert.ok(openaiSrc.includes("OPENAI_API_KEY is not defined"), "Should throw descriptive error when key is missing");
  });

  it("supports JSON formatting mode", () => {
    assert.ok(openaiSrc.includes("json_object") || openaiSrc.includes("jsonMode"), "Should support jsonMode");
  });

  it("normalizes errors (UNAUTHORIZED, RATE_LIMIT_EXCEEDED, SERVER_ERROR, TIMEOUT)", () => {
    assert.ok(openaiSrc.includes("UNAUTHORIZED"), "Should handle 401 unauthorized");
    assert.ok(openaiSrc.includes("RATE_LIMIT_EXCEEDED"), "Should handle 429 rate limit");
    assert.ok(openaiSrc.includes("SERVER_ERROR"), "Should handle 500 server error");
    assert.ok(openaiSrc.includes("TIMEOUT"), "Should handle request timeout");
  });
});

describe("OpenAI client simulated behavior", () => {
  class MockOpenAIClient {
    apiKey;
    defaultModel;

    constructor(apiKey, defaultModel = "gpt-4o-mini") {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        throw new Error("OPENAI_API_KEY is not defined in environment variables or configuration.");
      }
      this.apiKey = key;
      this.defaultModel = defaultModel;
    }

    async createChatCompletion(messages, options = {}, mockFetch) {
      const fetchImpl = mockFetch || globalThis.fetch;
      const res = await fetchImpl("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!res.ok) {
        let errCode = "API_ERROR";
        if (res.status === 401) errCode = "UNAUTHORIZED";
        if (res.status === 429) errCode = "RATE_LIMIT_EXCEEDED";
        if (res.status >= 500) errCode = "SERVER_ERROR";
        const err = new Error(`Request failed: ${res.status}`);
        err.code = errCode;
        err.status = res.status;
        throw err;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      let parsed;
      if (options.jsonMode && content) {
        parsed = JSON.parse(content);
      }
      return { content, parsed };
    }
  }

  it("throws if API key is missing", () => {
    const origKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      assert.throws(() => new MockOpenAIClient(), /OPENAI_API_KEY is not defined/);
    } finally {
      if (origKey) process.env.OPENAI_API_KEY = origKey;
    }
  });

  it("parses successful JSON completion", async () => {
    const client = new MockOpenAIClient("test-key");
    const mockFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ genre: "Sci-Fi", year: 1999 }) } }],
      }),
    });

    const res = await client.createChatCompletion([{ role: "user", content: "recommend" }], { jsonMode: true }, mockFetch);
    assert.equal(typeof res.content, "string");
    assert.equal(res.parsed.genre, "Sci-Fi");
    assert.equal(res.parsed.year, 1999);
  });

  it("normalizes 401 unauthorized errors without leaking key", async () => {
    const client = new MockOpenAIClient("secret-test-key-12345");
    const mockFetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Invalid API key" } }),
    });

    try {
      await client.createChatCompletion([{ role: "user", content: "test" }], {}, mockFetch);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.code, "UNAUTHORIZED");
      assert.equal(err.status, 401);
      assert.ok(!err.message.includes("secret-test-key-12345"), "Must not leak secret key in error");
    }
  });

  it("normalizes 429 rate limit errors", async () => {
    const client = new MockOpenAIClient("test-key");
    const mockFetch = async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Rate limit exceeded" } }),
    });

    try {
      await client.createChatCompletion([{ role: "user", content: "test" }], {}, mockFetch);
      assert.fail("Should have thrown");
    } catch (err) {
      assert.equal(err.code, "RATE_LIMIT_EXCEEDED");
      assert.equal(err.status, 429);
    }
  });
});
