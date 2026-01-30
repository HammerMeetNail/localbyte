var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - visit page", function () {
  test("includes a titled map iframe and a directions link", async function ({ page }) {
    await page.goto("/demos/coffee-shop/visit.html");

    await expect(page.locator("iframe[title]")).toHaveCount(1);

    var directions = page.getByRole("link", { name: "Get directions" });
    await expect(directions).toHaveAttribute("href", /https:\\/\\/www\\.google\\.com\\/maps\\?q=/);
  });
});

