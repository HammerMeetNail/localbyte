var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

function isoToday() {
  var now = new Date();
  var rawMonth = String(now.getMonth() + 1);
  var rawDay = String(now.getDate());
  var mm = rawMonth.length < 2 ? "0" + rawMonth : rawMonth;
  var dd = rawDay.length < 2 ? "0" + rawDay : rawDay;
  return now.getFullYear() + "-" + mm + "-" + dd;
}

test.describe("Finance dashboard demo - transactions", function () {
  test("adds a transaction and persists after reload", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/transactions.html");

    await page.fill("#txn-date", isoToday());
    await page.selectOption("#txn-type", "expense");
    await page.fill("#txn-amount", "12.34");
    await page.selectOption("#txn-category", "groceries");
    await page.fill("#txn-note", "Test transaction");
    await page.click("button[type=\"submit\"]");

    await expect(page.locator("[data-transactions-tbody]")).toContainText("Test transaction");

    await page.reload();
    await expect(page.locator("[data-transactions-tbody]")).toContainText("Test transaction");
  });

  test("invalid submit shows accessible error summary", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/transactions.html");
    await page.click("button[type=\"submit\"]");

    var summary = page.locator("[data-form-errors]");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Please fix");
  });
});
