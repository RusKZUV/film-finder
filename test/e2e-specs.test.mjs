import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const configPath = path.join(process.cwd(), "playwright.config.ts");
const specPath = path.join(process.cwd(), "e2e", "user-journey.spec.ts");
const homePath = path.join(process.cwd(), "app", "page.tsx");

const configSrc = fs.readFileSync(configPath, "utf-8");
const specSrc = fs.readFileSync(specPath, "utf-8");
const homeSrc = fs.readFileSync(homePath, "utf-8");

describe("Playwright E2E configuration and user journey specs", () => {
  it("defines playwright configuration with webServer and headless chromium", () => {
    assert.ok(configSrc.includes("defineConfig"), "Should define playwright config");
    assert.ok(configSrc.includes("testDir: \"./e2e\""), "Should set testDir to e2e");
    assert.ok(configSrc.includes("webServer"), "Should configure local webServer");
  });

  it("defines Scenario 1: Search query and movie card results rendering", () => {
    assert.ok(specSrc.includes("Scenario 1"), "Spec should include Scenario 1");
    assert.ok(specSrc.includes("#movie-search-input"), "Should interact with search input");
    assert.ok(specSrc.includes("Why it matches"), "Should verify AI match explanation");
  });

  it("defines Scenario 2: Filter application and submission", () => {
    assert.ok(specSrc.includes("Scenario 2"), "Spec should include Scenario 2");
    assert.ok(specSrc.includes("aria-pressed"), "Should verify filter toggles");
  });

  it("defines Scenario 3 & 4: Watchlist addition, persistence across reload, and removal", () => {
    assert.ok(specSrc.includes("Scenario 3"), "Spec should include Scenario 3");
    assert.ok(specSrc.includes("page.reload()"), "Should verify persistence across browser reload");
    assert.ok(specSrc.includes("Your watchlist is empty"), "Should verify empty state on item removal");
  });

  it("mocks upstream API calls to avoid burning live API keys", () => {
    assert.ok(specSrc.includes("page.route(\"**/api/search\""), "Spec should stub /api/search");
  });

  it("integrates search submission and movie grid rendering on app/page.tsx", () => {
    assert.ok(homeSrc.includes("<SearchBar onSearch={handleSearch}"), "Home should pass handleSearch callback");
    assert.ok(homeSrc.includes("<MovieGrid movies={movies}"), "Home should render MovieGrid with results");
  });
});
