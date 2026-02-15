var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Easy Email demo - portfolio integration", function () {
  test("portfolio links to demo in a new tab", async function ({ page }) {
    await page.goto("/portfolio.html");
    var link = page.locator("a[href=\"demos/easy-email/index.html\"]").first();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  });
});
