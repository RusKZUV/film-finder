import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("components/SearchBar.tsx and components/FilterPanel.tsx: structure and accessibility", () => {
  const searchBarPath = path.resolve(process.cwd(), "components/SearchBar.tsx");
  const filterPanelPath = path.resolve(process.cwd(), "components/FilterPanel.tsx");

  assert.ok(fs.existsSync(searchBarPath), "components/SearchBar.tsx must exist");
  assert.ok(fs.existsSync(filterPanelPath), "components/FilterPanel.tsx must exist");

  const searchBarContent = fs.readFileSync(searchBarPath, "utf-8");
  assert.match(searchBarContent, /id="movie-search-input"/, "Must have movie search input id");
  assert.match(searchBarContent, /aria-expanded/, "Filter toggle button must have aria-expanded");
  assert.match(searchBarContent, /aria-controls="filter-panel"/, "Filter button must have aria-controls");
  assert.match(searchBarContent, /trim\(\)/, "Must check for empty or whitespace-only queries");

  const filterPanelContent = fs.readFileSync(filterPanelPath, "utf-8");
  assert.match(filterPanelContent, /Genres/, "Filter panel must have genre selector");
  assert.match(filterPanelContent, /id="year-from"/, "Filter panel must have year-from input");
  assert.match(filterPanelContent, /id="year-to"/, "Filter panel must have year-to input");
  assert.match(filterPanelContent, /id="min-rating"/, "Filter panel must have min-rating input");
});
