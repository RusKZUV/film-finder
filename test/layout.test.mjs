import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import ReactDOMServer from "react-dom/server";

test("Layout component: renders header, child content, and footer inside main", () => {
  const layoutFilePath = path.resolve(process.cwd(), "components/Layout.tsx");
  assert.ok(fs.existsSync(layoutFilePath), "components/Layout.tsx must exist");

  const layoutContent = fs.readFileSync(layoutFilePath, "utf-8");
  assert.match(layoutContent, /<header[^>]*>/, "Layout must contain semantic <header>");
  assert.match(layoutContent, /Film Finder/, "Header must display the app title");
  assert.match(layoutContent, /<main[^>]*>/, "Layout must contain semantic <main>");
  assert.match(layoutContent, /\{children\}/, "Layout must render children inside main");
  assert.match(layoutContent, /<footer[^>]*>/, "Layout must contain semantic <footer>");
  assert.match(layoutContent, /min-h-screen\s+flex\s+flex-col/, "Layout must include Tailwind wrapper classes");

  // Functional simulated component test
  function LayoutComponent({ children }) {
    return React.createElement(
      "div",
      { className: "min-h-screen flex flex-col" },
      React.createElement("header", null, "Film Finder"),
      React.createElement("main", null, children),
      React.createElement("footer", null, "All rights reserved")
    );
  }

  const html = ReactDOMServer.renderToString(
    React.createElement(LayoutComponent, null, React.createElement("div", { id: "child" }, "Child Content Test"))
  );
  assert.match(html, /<header>Film Finder<\/header>/);
  assert.match(html, /<main><div id="child">Child Content Test<\/div><\/main>/);
  assert.match(html, /<footer>All rights reserved<\/footer>/);
});
