var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("LaunchClock demo - portfolio integration", function () {
  test("portfolio links open in new tab with noreferrer", async function ({ page }) {
    await page.goto("/portfolio.html");
    var link = page.locator("a.portfolio-thumb[href=\"demos/launchclock/index.html\"]").first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noreferrer");
  });
});

