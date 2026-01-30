var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("LaunchClock demo - smoke", function () {
  var pages = [
    "/demos/launchclock/index.html",
    "/demos/launchclock/countdown.html",
    "/demos/launchclock/404.html"
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

