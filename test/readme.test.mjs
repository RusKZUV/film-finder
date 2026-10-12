import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const readmePath = path.join(process.cwd(), "README.md");
const readmeSrc = fs.readFileSync(readmePath, "utf-8");

describe("README.md documentation completeness", () => {
  it("documents project overview and tech stack", () => {
    assert.ok(readmeSrc.includes("Film Finder"), "Should have project title");
    assert.ok(readmeSrc.includes("Next.js"), "Should list Next.js");
    assert.ok(readmeSrc.includes("TMDB API"), "Should list TMDB API");
    assert.ok(readmeSrc.includes("OpenAI"), "Should list OpenAI");
  });

  it("documents prerequisites and npm install instructions", () => {
    assert.ok(readmeSrc.includes("Node.js"), "Should state Node.js prerequisite");
    assert.ok(readmeSrc.includes("npm install"), "Should document npm install");
  });

  it("documents environment variables configuration (.env.local)", () => {
    assert.ok(readmeSrc.includes("TMDB_API_KEY"), "Should mention TMDB_API_KEY");
    assert.ok(readmeSrc.includes("OPENAI_API_KEY"), "Should mention OPENAI_API_KEY");
    assert.ok(readmeSrc.includes(".env.local"), "Should mention .env.local setup");
  });

  it("documents development and test commands", () => {
    assert.ok(readmeSrc.includes("npm run dev"), "Should document npm run dev");
    assert.ok(readmeSrc.includes("npm test"), "Should document npm test");
  });

  it("includes TMDB attribution and compliance notice", () => {
    assert.ok(
      readmeSrc.includes("This product uses the TMDB API but is not endorsed or certified by TMDB"),
      "Must include standard TMDB attribution notice"
    );
  });

  it("references AGENTS.md rules and process docs", () => {
    assert.ok(readmeSrc.includes("AGENTS.md"), "Should reference AGENTS.md");
    assert.ok(readmeSrc.includes("_docs/process.md"), "Should reference process.md");
  });
});
