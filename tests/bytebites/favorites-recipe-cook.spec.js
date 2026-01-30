var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("ByteBites demo - favorites, recipe detail, cooking mode", function () {
  test("favorite persists and cooking mode navigation works", async function ({ page }) {
    await page.goto("/demos/bytebites/index.html");

    await page.locator("[data-search]").fill("curry");
    await expect(page.locator("[data-results-count]")).toHaveText("1");

    await page.locator("[data-cards] .favorite-btn").click();
    await page.reload();

    await page.locator("[data-favorites-only]").check();
    await expect(page.locator("[data-results-count]")).toHaveText("1");

    await page.getByRole("link", { name: "Coconut Chickpea Curry" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Coconut Chickpea Curry" })).toBeVisible();

    await page.evaluate(function () {
      window.__printed = false;
      window.print = function () { window.__printed = true; };
    });
    await page.locator("[data-print]").click();
    await expect.poll(async function () {
      return await page.evaluate(function () { return window.__printed; });
    }).toBe(true);

    await page.locator("[data-cook]").click();
    await expect(page.locator("[data-cook-step-badge]")).toContainText("Step 1 of");

    await page.locator("[data-next]").click();
    await expect(page.locator("[data-cook-step-badge]")).toContainText("Step 2");

    await page.locator("[data-open-jump]").click();
    await page.locator("[data-step-list] button").nth(0).click();
    await expect(page.locator("[data-cook-step-badge]")).toContainText("Step 1");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { level: 1, name: "Coconut Chickpea Curry" })).toBeVisible();
  });
});

