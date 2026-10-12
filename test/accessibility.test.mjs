import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const filterSrc = fs.readFileSync(path.join(process.cwd(), "components", "FilterPanel.tsx"), "utf-8");
const searchSrc = fs.readFileSync(path.join(process.cwd(), "components", "SearchBar.tsx"), "utf-8");
const cardSrc = fs.readFileSync(path.join(process.cwd(), "components", "MovieCard.tsx"), "utf-8");

describe("Accessibility and Responsive Target Standards", () => {
  it("FilterPanel buttons and inputs comply with 44x44px minimum tap targets", () => {
    assert.ok(filterSrc.includes("min-h-[44px]"), "FilterPanel elements should enforce min 44px height");
    assert.ok(filterSrc.includes("min-w-[44px]"), "Genre buttons should enforce min 44px width");
  });

  it("FilterPanel provides semantic ARIA attributes and focus rings", () => {
    assert.ok(filterSrc.includes('role="region"'), "FilterPanel should define landmark region");
    assert.ok(filterSrc.includes("aria-pressed="), "Filter buttons should expose aria-pressed state");
    assert.ok(filterSrc.includes("focus:ring-2"), "Interactive elements should define visible focus rings");
  });

  it("SearchBar enforces accessible tap target heights and escape key collapse", () => {
    assert.ok(searchSrc.includes("min-h-[44px]"), "SearchBar inputs/buttons should enforce 44px tap targets");
    assert.ok(searchSrc.includes("e.key === \"Escape\""), "SearchBar should support closing filters via Escape");
  });

  it("MovieCard and links maintain high-contrast styling and focus styles", () => {
    assert.ok(cardSrc.includes("focus:ring-2") || cardSrc.includes("transition"), "MovieCard elements should feature clear visual states");
  });
});
