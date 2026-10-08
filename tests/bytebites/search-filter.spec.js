var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("ByteBites demo - search + filters + persistence", function () {
  test("search uses OR tokens and filters persist after reload", async function ({ page }) {
    await page.goto("/demos/bytebites/index.html");

    await page.locator("[data-search]").fill("chicken curry");
    await expect(page.locator("[data-results-count]")).toHaveText("2");
    await expect(page.locator("[data-cards] h3")).toHaveText(["Coconut Chickpea Curry", "Garlic Lemon Chicken"]);

    await page.locator("label.check:has-text(\"Vegan\") input").check();
    await expect(page.locator("[data-results-count]")).toHaveText("1");
    await expect(page.locator("[data-cards] h3")).toHaveText(["Coconut Chickpea Curry"]);

    await page.reload();
    await expect(page.locator("[data-search]")).toHaveValue("chicken curry");
    await expect(page.locator("label.check:has-text(\"Vegan\") input")).toBeChecked();
    await expect(page.locator("[data-results-count]")).toHaveText("1");
    await expect(page.locator("[data-cards] h3")).toHaveText(["Coconut Chickpea Curry"]);

    await page.locator("[data-clear-all]").click();
    await expect(page.locator("[data-results-count]")).toHaveText("11");
  });
});
