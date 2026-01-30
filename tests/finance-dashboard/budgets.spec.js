var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

function monthKey() {
  var now = new Date();
  var rawMonth = String(now.getMonth() + 1);
  var mm = rawMonth.length < 2 ? "0" + rawMonth : rawMonth;
  return now.getFullYear() + "-" + mm;
}

test.describe("Finance dashboard demo - budgets", function () {
  test("sets budgets and persists after reload", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/budgets.html");

    await page.fill("#budget-month", monthKey());
    await page.fill("#budget-overall", "999");
    await page.fill("#budget-groceries", "123");
    await page.click("button[type=\"submit\"]");

    await expect(page.locator("text=Budgets saved.")).toHaveCount(1);

    await page.reload();
    await expect(page.locator("#budget-overall")).toHaveValue("999");
    await expect(page.locator("#budget-groceries")).toHaveValue("123");
  });
});

