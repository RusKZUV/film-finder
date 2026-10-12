import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("env template: .env.example exists and contains required keys without secrets", () => {
  const envExamplePath = path.resolve(process.cwd(), ".env.example");
  assert.ok(fs.existsSync(envExamplePath), ".env.example must exist");

  const content = fs.readFileSync(envExamplePath, "utf-8");
  assert.match(content, /TMDB_API_KEY="your_tmdb_api_key_here"/);
  assert.match(content, /OPENAI_API_KEY="your_openai_api_key_here"/);
  assert.match(content, /\.env\.local/);

  // Check .gitignore ignores .env.local
  const gitignorePath = path.resolve(process.cwd(), ".gitignore");
  const gitignore = fs.readFileSync(gitignorePath, "utf-8");
  assert.match(gitignore, /\.env\.local/);
});
