import { test, expect } from "@playwright/test";

test.describe("Film Finder User Journeys (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Stub /api/search to avoid burning real upstream API tokens
    await page.route("**/api/search", async (route) => {
      const req = route.request();
      const body = JSON.parse(req.postData() || "{}");

      if (body.query === "empty-query-test") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ results: [], meta: { count: 0, querySummary: "No results" } }),
        });
        return;
      }

      const mockResults = [
        {
          id: 550,
          title: "Fight Club",
          releaseDate: "1999-10-15",
          rating: 8.4,
          runtime: 139,
          posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
          overview: "A ticking-time-bomb insomniac forms an underground club.",
          genres: ["Drama", "Thriller"],
          matchExplanation: "Matches your query for high-tension psychological thrillers.",
        },
        {
          id: 238,
          title: "The Godfather",
          releaseDate: "1972-03-14",
          rating: 9.2,
          runtime: 175,
          posterPath: "/3bhkrj58Vtu7enYsLagFZuhL6TQ.jpg",
          overview: "The aging patriarch of an organized crime dynasty.",
          genres: ["Drama", "Crime"],
          matchExplanation: "Legendary drama matching your criteria.",
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: mockResults,
          meta: { count: 2, querySummary: `Showing results for "${body.query}"` },
        }),
      });
    });
  });

  test("Scenario 1: User visits home, enters natural language query, and views ranked results", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Discover Your Next Favorite Film");

    const searchInput = page.locator("#movie-search-input");
    await searchInput.fill("psychological thriller with a twist");

    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // Verify ranked movie card renders
    const fightClubCard = page.locator('article[aria-label="Movie card: Fight Club"]');
    await expect(fightClubCard).toBeVisible();
    await expect(fightClubCard).toContainText("Fight Club");
    await expect(fightClubCard).toContainText("1999");
    await expect(fightClubCard).toContainText("8.4");
    await expect(fightClubCard).toContainText("Why it matches");
  });

  test("Scenario 2: User applies a filter and submits search", async ({ page }) => {
    await page.goto("/");

    // Toggle filter panel
    const filterToggle = page.locator('button:has-text("Filters")');
    await filterToggle.click();
    await expect(page.locator("#filter-panel")).toBeVisible();

    // Select genre
    const dramaBtn = page.locator('button:has-text("Drama")');
    await dramaBtn.click();
    await expect(dramaBtn).toHaveAttribute("aria-pressed", "true");

    // Perform search
    await page.locator("#movie-search-input").fill("great films");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('article[aria-label="Movie card: Fight Club"]')).toBeVisible();
  });

  test("Scenario 3 & 4: User adds movie to watchlist, verifies persistence across reload, and removes it", async ({ page }) => {
    await page.goto("/");
    await page.locator("#movie-search-input").fill("classic");
    await page.locator('button[type="submit"]').click();

    const fightClubCard = page.locator('article[aria-label="Movie card: Fight Club"]');
    await expect(fightClubCard).toBeVisible();

    // Click Add to Watchlist
    const watchlistBtn = fightClubCard.locator('button[aria-label="Add Fight Club to watchlist"]');
    await watchlistBtn.click();
    await expect(fightClubCard.locator('button:has-text("In Watchlist")')).toBeVisible();

    // Navigate to /watchlist
    await page.locator('a:has-text("Watchlist")').click();
    await expect(page).toHaveURL("/watchlist");
    await expect(page.locator("h1")).toContainText("My Watchlist");
    await expect(page.locator('article[aria-label="Movie card: Fight Club"]')).toBeVisible();

    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('article[aria-label="Movie card: Fight Club"]')).toBeVisible();

    // Remove from watchlist
    const removeBtn = page.locator('button[aria-label="Remove Fight Club from watchlist"]');
    await removeBtn.click();

    // Verify empty state appears
    await expect(page.locator("text=Your watchlist is empty")).toBeVisible();
  });
});
