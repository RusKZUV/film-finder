import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const btnPath = path.join(process.cwd(), "components", "WatchlistButton.tsx");
const cardPath = path.join(process.cwd(), "components", "MovieCard.tsx");
const btnSrc = fs.readFileSync(btnPath, "utf-8");
const cardSrc = fs.readFileSync(cardPath, "utf-8");

describe("components/WatchlistButton.tsx structure & accessibility", () => {
  it("renders button with dynamic aria-label and aria-pressed attributes", () => {
    assert.ok(btnSrc.includes("aria-label={ariaLabel}"), "Should have dynamic aria-label");
    assert.ok(btnSrc.includes("aria-pressed={saved}"), "Should have aria-pressed attribute");
  });

  it("stops event propagation on click to protect parent cards", () => {
    assert.ok(btnSrc.includes("e.stopPropagation()"), "Should stop click propagation");
  });

  it("displays distinct text for Add to Watchlist vs In Watchlist", () => {
    assert.ok(btnSrc.includes("Add to Watchlist"), "Should have Add state label");
    assert.ok(btnSrc.includes("In Watchlist"), "Should have Saved state label");
  });

  it("calls watchlist storage methods", () => {
    assert.ok(btnSrc.includes("addToWatchlist"), "Should call addToWatchlist");
    assert.ok(btnSrc.includes("removeFromWatchlist"), "Should call removeFromWatchlist");
    assert.ok(btnSrc.includes("isInWatchlist"), "Should check isInWatchlist");
  });
});

describe("MovieCard integration with WatchlistButton", () => {
  it("embeds WatchlistButton inside MovieCard", () => {
    assert.ok(cardSrc.includes("<WatchlistButton"), "MovieCard should render WatchlistButton");
  });
});
