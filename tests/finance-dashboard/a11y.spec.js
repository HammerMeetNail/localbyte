var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;
var axeCore = require("axe-core");

async function runAxe(page) {
  await page.addScriptTag({ content: axeCore.source });
  return await page.evaluate(async function () {
    return await axe.run(document, {
      rules: {
        "color-contrast": { enabled: false }
      }
    });
  });
}

test.describe("Finance dashboard demo - basic accessibility checks", function () {
  test("dashboard has no serious or critical axe violations", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/index.html");
    var results = await runAxe(page);
    var violations = results.violations.filter(function (v) {
      return v.impact === "critical" || v.impact === "serious";
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test("transactions has no serious or critical axe violations", async function ({ page }) {
    await page.goto("/demos/finance-dashboard/transactions.html");
    var results = await runAxe(page);
    var violations = results.violations.filter(function (v) {
      return v.impact === "critical" || v.impact === "serious";
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});

