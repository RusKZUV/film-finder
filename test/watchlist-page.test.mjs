import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const pagePath = path.join(process.cwd(), "app", "watchlist", "page.tsx");
const layoutPath = path.join(process.cwd(), "components", "Layout.tsx");
const pageSrc = fs.readFileSync(pagePath, "utf-8");
const layoutSrc = fs.readFileSync(layoutPath, "utf-8");

describe("app/watchlist/page.tsx structure & requirements", () => {
  it("renders watchlist page layout and reads from lib/watchlist", () => {
    assert.ok(pageSrc.includes("getWatchlist"), "Page should call getWatchlist");
    assert.ok(pageSrc.includes("<MovieCard"), "Page should render MovieCard components");
    assert.ok(pageSrc.includes("<Layout>"), "Page should wrap content in Layout");
  });

  it("displays an informative local storage notice", () => {
    assert.ok(pageSrc.includes("stored locally"), "Should display local storage notice");
    assert.ok(pageSrc.includes("current browser") || pageSrc.includes("not sync"), "Notice should clarify lack of multi-device sync");
  });

  it("renders empty state with CTA link to search/discovery", () => {
    assert.ok(pageSrc.includes("Your watchlist is empty"), "Should render empty state message");
    assert.ok(pageSrc.includes('href="/"'), "Empty state should link to home/search");
    assert.ok(pageSrc.includes("Discover Movies") || pageSrc.includes("Explore"), "Should display CTA button/link");
  });

  it("renders responsive movie grid container", () => {
    assert.ok(pageSrc.includes("grid-cols-1"), "Grid should have 1 column on mobile");
    assert.ok(pageSrc.includes("sm:grid-cols-2"), "Grid should have 2 columns on tablet");
    assert.ok(pageSrc.includes("lg:grid-cols-4") || pageSrc.includes("md:grid-cols-3"), "Grid should have responsive desktop columns");
  });

  it("Layout component contains navigation links for Search and Watchlist", () => {
    assert.ok(layoutSrc.includes('href="/watchlist"'), "Layout navigation should link to /watchlist");
    assert.ok(layoutSrc.includes('href="/"'), "Layout navigation should link to /");
  });
});
