import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const spinnerSrc = fs.readFileSync(
  path.join(process.cwd(), "components", "LoadingSpinner.tsx"),
  "utf-8"
);
const emptySrc = fs.readFileSync(
  path.join(process.cwd(), "components", "EmptyState.tsx"),
  "utf-8"
);
const errorSrc = fs.readFileSync(
  path.join(process.cwd(), "components", "ErrorState.tsx"),
  "utf-8"
);

describe("components/LoadingSpinner.tsx", () => {
  it("has role=status for screen readers", () => {
    assert.ok(spinnerSrc.includes('role="status"'), "Should have role=status");
  });

  it("has aria-busy=true", () => {
    assert.ok(
      spinnerSrc.includes('aria-busy="true"'),
      "Should have aria-busy=true"
    );
  });

  it("has aria-live=polite", () => {
    assert.ok(
      spinnerSrc.includes('aria-live="polite"'),
      "Should have aria-live=polite"
    );
  });

  it("renders a spinning animation", () => {
    assert.ok(
      spinnerSrc.includes("animate-spin") || spinnerSrc.includes("spin"),
      "Should have spinning animation"
    );
  });

  it("renders a descriptive message", () => {
    assert.ok(
      spinnerSrc.includes("Searching") || spinnerSrc.includes("message"),
      "Should render a search status message"
    );
  });
});

describe("components/EmptyState.tsx", () => {
  it("has role=status", () => {
    assert.ok(emptySrc.includes('role="status"'), "Should have role=status");
  });

  it("has aria-live=polite", () => {
    assert.ok(
      emptySrc.includes('aria-live="polite"'),
      "Should have aria-live=polite"
    );
  });

  it("renders No results found message", () => {
    assert.ok(
      emptySrc.includes("No results found"),
      "Should display 'No results found' text"
    );
  });

  it("suggests how to broaden filters", () => {
    assert.ok(
      emptySrc.includes("broaden") ||
        emptySrc.includes("filter") ||
        emptySrc.includes("adjust"),
      "Should suggest broadening filters or changing query"
    );
  });

  it("accepts optional query prop for context", () => {
    assert.ok(
      emptySrc.includes("query") && emptySrc.includes("QueryProps") ||
        emptySrc.includes("query?:"),
      "Should accept optional query prop"
    );
  });
});

describe("components/ErrorState.tsx", () => {
  it("has role=alert for urgent announcements", () => {
    assert.ok(errorSrc.includes('role="alert"'), "Should have role=alert");
  });

  it("has aria-live=assertive", () => {
    assert.ok(
      errorSrc.includes('aria-live="assertive"'),
      "Should have aria-live=assertive"
    );
  });

  it("renders an error heading", () => {
    assert.ok(
      errorSrc.includes("Search failed") || errorSrc.includes("error"),
      "Should render an error heading"
    );
  });

  it("renders a helpful error message", () => {
    assert.ok(
      errorSrc.includes("message") || errorSrc.includes("try again"),
      "Should render a helpful error message"
    );
  });

  it("renders a retry button", () => {
    assert.ok(
      errorSrc.includes("Retry") || errorSrc.includes("retry"),
      "Should render a retry button"
    );
    assert.ok(
      errorSrc.includes("<button") || errorSrc.includes("Button"),
      "Retry should be a button element"
    );
  });

  it("retry button has accessible aria-label", () => {
    assert.ok(
      errorSrc.includes('aria-label="Retry') || errorSrc.includes("aria-label"),
      "Retry button should have aria-label"
    );
  });

  it("accepts optional onRetry callback prop", () => {
    assert.ok(
      errorSrc.includes("onRetry"),
      "Should accept onRetry callback prop"
    );
  });
});
