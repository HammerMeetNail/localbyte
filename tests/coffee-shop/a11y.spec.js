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

test.describe("Coffee shop demo - basic accessibility checks", function () {
  test("index has no serious or critical axe violations", async function ({ page }) {
    await page.goto("/demos/coffee-shop/index.html");
    var results = await runAxe(page);
    var violations = results.violations.filter(function (v) {
      return v.impact === "critical" || v.impact === "serious";
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });

  test("order has no serious or critical axe violations", async function ({ page }) {
    await page.goto("/demos/coffee-shop/order.html");
    var results = await runAxe(page);
    var violations = results.violations.filter(function (v) {
      return v.impact === "critical" || v.impact === "serious";
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
});

