var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;
var fs = require("fs");

test.describe("Finance dashboard demo - CSV export", function () {
  test("exports a CSV download", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/settings.html");

    var downloadPromise = page.waitForEvent("download");
    await page.click("[data-export-csv]");
    var download = await downloadPromise;

    var filePath = await download.path();
    expect(filePath).toBeTruthy();

    var content = fs.readFileSync(filePath, "utf8");
    expect(content).toContain("date,type,category,amount,note");
  });
});

