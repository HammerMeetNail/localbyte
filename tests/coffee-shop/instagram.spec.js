var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - instagram feed fallback", function () {
  test("shows fallback note when feed json fails to load", async function ({ page }) {
    await page.route("**/demos/coffee-shop/assets/data/instagram.json", function (route) {
      route.abort();
    });

    await page.goto("/demos/coffee-shop/index.html");

    await expect(page.locator("[data-feed-note]")).toBeVisible();
  });
});

