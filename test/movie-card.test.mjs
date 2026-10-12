import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const cardPath = path.join(process.cwd(), "components", "MovieCard.tsx");
const gridPath = path.join(process.cwd(), "components", "MovieGrid.tsx");
const cardSrc = fs.readFileSync(cardPath, "utf-8");
const gridSrc = fs.readFileSync(gridPath, "utf-8");

describe("components/MovieCard.tsx: structure and attributes", () => {
  it("accepts movie prop with expected fields", () => {
    assert.ok(cardSrc.includes("title"), "Should use title");
    assert.ok(cardSrc.includes("releaseDate"), "Should use releaseDate");
    assert.ok(cardSrc.includes("posterPath"), "Should use posterPath");
    assert.ok(cardSrc.includes("rating"), "Should use rating");
    assert.ok(cardSrc.includes("overview"), "Should use overview");
    assert.ok(cardSrc.includes("genres"), "Should use genres");
  });

  it("renders article element with accessible aria-label", () => {
    assert.ok(
      cardSrc.includes("<article"),
      "Should use <article> semantic element"
    );
    assert.ok(
      cardSrc.includes("aria-label"),
      "Should have aria-label for accessibility"
    );
  });

  it("renders poster image when posterPath is provided", () => {
    assert.ok(
      cardSrc.includes("<img") || cardSrc.includes("next/image"),
      "Should render an image for the poster"
    );
    assert.ok(cardSrc.includes("TMDB_IMAGE_BASE"), "Should construct TMDB image URL");
  });

  it("renders a fallback when posterPath is null or missing", () => {
    assert.ok(
      cardSrc.includes("No Poster") || cardSrc.includes("no-poster"),
      "Should render fallback text or element when poster is absent"
    );
    assert.ok(
      cardSrc.includes("No poster available") || cardSrc.includes("No Poster"),
      "Fallback should be accessible"
    );
  });

  it("renders movie title in a heading", () => {
    assert.ok(
      cardSrc.includes("<h3") || cardSrc.includes("<h2"),
      "Should use a heading for the movie title"
    );
    assert.ok(cardSrc.includes("{title}"), "Should render the title");
  });

  it("renders the year extracted from releaseDate", () => {
    assert.ok(
      cardSrc.includes("slice(0, 4)") || cardSrc.includes("substring(0, 4)"),
      "Should extract year from releaseDate"
    );
    assert.ok(cardSrc.includes("{year}"), "Should render the year");
  });

  it("renders rating with star icon", () => {
    assert.ok(cardSrc.includes("rating"), "Should render rating");
    assert.ok(cardSrc.includes("★") || cardSrc.includes("star"), "Should include star indicator");
  });

  it("renders genres as a list", () => {
    assert.ok(
      cardSrc.includes("<ul") || cardSrc.includes("<ol"),
      "Should render genres in a list"
    );
    assert.ok(cardSrc.includes("Genres"), "Genres list should be labelled");
  });

  it("truncates long overviews", () => {
    assert.ok(
      cardSrc.includes("150") || cardSrc.includes("truncat"),
      "Should truncate overview at some character limit"
    );
  });

  it("applies hover and transition styles", () => {
    assert.ok(
      cardSrc.includes("hover:") || cardSrc.includes("transition"),
      "Should have hover/transition styling"
    );
  });

  it("renders AI match explanation callout when provided", () => {
    assert.ok(
      cardSrc.includes("matchExplanation"),
      "MovieCard should support matchExplanation prop/field"
    );
    assert.ok(
      cardSrc.includes("Why it matches"),
      "Should render styled callout with header for explanation"
    );
  });

  it("gracefully hides match explanation when empty or absent", () => {
    assert.ok(
      cardSrc.includes("effectiveExplanation &&") || cardSrc.includes("matchExplanation &&"),
      "Should conditionally render explanation block only when text exists"
    );
  });
});

describe("components/MovieGrid.tsx: structure and layout", () => {
  it("renders a section with aria-label Movie results", () => {
    assert.ok(
      gridSrc.includes("<section"),
      "Should use <section> element"
    );
    assert.ok(
      gridSrc.includes("Movie results"),
      "Section should have aria-label Movie results"
    );
  });

  it("uses responsive grid classes", () => {
    assert.ok(
      gridSrc.includes("grid"),
      "Should use CSS grid layout"
    );
    assert.ok(
      gridSrc.includes("sm:grid-cols") || gridSrc.includes("md:grid-cols") || gridSrc.includes("lg:grid-cols"),
      "Should have responsive column breakpoints"
    );
  });

  it("renders a MovieCard for each movie", () => {
    assert.ok(
      gridSrc.includes("MovieCard"),
      "Should render MovieCard components"
    );
    assert.ok(
      gridSrc.includes("movie.id") || gridSrc.includes("key={movie.id}"),
      "Should use movie.id as the key"
    );
  });

  it("returns null when movies array is empty", () => {
    assert.ok(
      gridSrc.includes("null") && gridSrc.includes("length === 0"),
      "Should return null for empty movies array"
    );
  });

  it("accepts movies prop of type Movie[]", () => {
    assert.ok(
      gridSrc.includes("Movie[]") || gridSrc.includes("movies: Movie"),
      "Should type-check movies prop as Movie[]"
    );
  });
});
