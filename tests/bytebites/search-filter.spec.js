var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("ByteBites demo - search + filters + persistence", function () {
  test("search uses OR tokens and filters persist after reload", async function ({ page }) {
    await page.goto("/demos/bytebites/index.html");

    await page.locator("[data-search]").fill("tofu curry");
    await expect(page.locator("[data-results-count]")).toHaveText("1");

    await page.locator("label.check:has-text(\"Vegan\") input").check();
    await expect(page.locator("[data-results-count]")).toHaveText("1");

    await page.reload();
    await expect(page.locator("[data-search]")).toHaveValue("tofu curry");
    await expect(page.locator("label.check:has-text(\"Vegan\") input")).toBeChecked();
    await expect(page.locator("[data-results-count]")).toHaveText("1");

    await page.locator("[data-clear-all]").click();
    await expect(page.locator("[data-results-count]")).toHaveText("11");
  });
});
