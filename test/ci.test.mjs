import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test(".github/workflows/ci.yml: exists and satisfies CI specifications", () => {
  const ciPath = path.resolve(process.cwd(), ".github/workflows/ci.yml");
  assert.ok(fs.existsSync(ciPath), ".github/workflows/ci.yml must exist");

  const content = fs.readFileSync(ciPath, "utf-8");
  assert.match(content, /on:\s+push:/, "Workflow must trigger on push");
  assert.match(content, /pull_request:/, "Workflow must trigger on pull_request");
  assert.match(content, /actions\/checkout@v4/, "Workflow must use checkout action");
  assert.match(content, /actions\/setup-node@v4/, "Workflow must use setup-node action");
  assert.match(content, /cache:\s*["']npm["']/, "Workflow must configure npm cache");
  assert.match(content, /npm (ci|install)/, "Workflow must install dependencies");
  assert.match(content, /npm test/, "Workflow must run tests");
  assert.match(content, /20\.x/, "Workflow matrix must include Node 20.x");
});
