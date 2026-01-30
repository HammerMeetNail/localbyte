var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Finance dashboard demo - smoke", function () {
  var pages = [
    "/demos/finance-dashboard/index.html",
    "/demos/finance-dashboard/transactions.html",
    "/demos/finance-dashboard/budgets.html",
    "/demos/finance-dashboard/settings.html",
    "/demos/finance-dashboard/404.html"
  ];

  pages.forEach(function (urlPath) {
    test("loads " + urlPath, async function ({ page }) {
      await page.goto(urlPath);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("a.skip-link")).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
    });
  });
});

