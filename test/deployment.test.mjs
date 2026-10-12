import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const vercelJsonPath = path.join(process.cwd(), "vercel.json");
const nextConfigPath = path.join(process.cwd(), "next.config.ts");
const docsPath = path.join(process.cwd(), "_docs", "vercel-deployment.md");

const vercelJsonSrc = fs.readFileSync(vercelJsonPath, "utf-8");
const nextConfigSrc = fs.readFileSync(nextConfigPath, "utf-8");
const docsSrc = fs.readFileSync(docsPath, "utf-8");

describe("Production Build and Vercel Deployment Configuration", () => {
  it("defines valid vercel.json with nextjs framework", () => {
    assert.ok(vercelJsonSrc.includes("nextjs"), "vercel.json should target Next.js framework");
    assert.ok(vercelJsonSrc.includes("next build"), "vercel.json should define next build command");
  });

  it("configures HTTP security headers in next.config.ts", () => {
    assert.ok(nextConfigSrc.includes("X-Content-Type-Options"), "Should define X-Content-Type-Options");
    assert.ok(nextConfigSrc.includes("X-Frame-Options"), "Should define X-Frame-Options");
    assert.ok(nextConfigSrc.includes("Referrer-Policy"), "Should define Referrer-Policy");
  });

  it("documents required environment variable checklist", () => {
    assert.ok(docsSrc.includes("TMDB_API_KEY"), "Documentation should list TMDB_API_KEY");
    assert.ok(docsSrc.includes("OPENAI_API_KEY"), "Documentation should list OPENAI_API_KEY");
  });
});
