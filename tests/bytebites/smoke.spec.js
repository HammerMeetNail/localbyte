var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("ByteBites demo - smoke", function () {
  test("index loads and renders recipe cards", async function ({ page }) {
    await page.goto("/demos/bytebites/index.html");
    await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
    await expect(page.locator("[data-cards] article")).toHaveCount(11);
    await expect(page.locator("[data-results-count]")).toHaveText("11");
  });
});

