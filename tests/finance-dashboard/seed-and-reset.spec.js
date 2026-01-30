var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Finance dashboard demo - seed and reset", function () {
  test("first run seeds sample data", async function ({ page }) {
    await page.addInitScript(function () {
      try {
        localStorage.removeItem("lb.financeDashboard");
      } catch (e) {
      }
    });

    await page.goto("/demos/finance-dashboard/index.html");
    await expect(page.locator("[data-sample-banner]")).toBeVisible();
  });

  test("reset-to-empty stays empty after reload", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/settings.html");

    page.once("dialog", async function (dialog) {
      await dialog.accept();
    });
    await page.click("[data-reset-empty]");

    await page.waitForURL("**/demos/finance-dashboard/index.html");
    await expect(page.locator("[data-sample-banner]")).toBeHidden();

    await page.reload();
    await expect(page.locator("[data-sample-banner]")).toBeHidden();
  });
});

