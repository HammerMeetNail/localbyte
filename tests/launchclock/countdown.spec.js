var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("LaunchClock demo - countdown page", function () {
  test("renders from URL and countdown decrements", async function ({ page }) {
    var ts = Date.now() + 6500;
    var url = "/demos/launchclock/countdown.html?name=Ship%20It&ts=" + ts + "&tpl=minimal&pal=teal";

    await page.goto(url);
    await expect(page.locator(".lc-title")).toHaveText("Ship It");

    var sec1 = await page.locator("[data-part=\"seconds\"]").textContent();
    await page.waitForTimeout(1500);
    var sec2 = await page.locator("[data-part=\"seconds\"]").textContent();

    expect(sec1).not.toBe(sec2);
  });

  test("expired timestamp shows event started UI", async function ({ page }) {
    var ts = Date.now() - 2000;
    var url = "/demos/launchclock/countdown.html?name=Already%20Live&ts=" + ts + "&tpl=bold&pal=slate";
    await page.goto(url);
    await expect(page.locator(".lc-expired")).toBeVisible();
  });

  test("social share links include encoded current URL", async function ({ page }) {
    var ts = Date.now() + 30000;
    var urlPath = "/demos/launchclock/countdown.html?name=Share%20Test&ts=" + ts + "&tpl=elegant&pal=plum";
    await page.goto(urlPath);

    var current = page.url();
    var encoded = encodeURIComponent(current);

    await expect(page.locator("a.share-pill", { hasText: "LinkedIn" })).toHaveAttribute("href", new RegExp(encoded));
    await expect(page.locator("a.share-pill", { hasText: "Facebook" })).toHaveAttribute("href", new RegExp(encoded));
  });

  test("demo signup validates and stores locally", async function ({ page }) {
    var ts = Date.now() + 30000;
    await page.goto("/demos/launchclock/countdown.html?name=Signup%20Test&ts=" + ts + "&tpl=minimal&pal=teal");

    await page.fill("#signup-email", "not-an-email");
    await page.click("button:has-text(\"Notify me\")");
    await expect(page.locator("[data-signup-status]")).toContainText("Enter a valid email");

    await page.fill("#signup-email", "demo@example.com");
    await page.click("button:has-text(\"Notify me\")");
    await expect(page.locator("[data-signup-status]")).toContainText("Thanks");

    await page.click("button:has-text(\"Clear demo signups\")");
    await expect(page.locator("[data-signup-status]")).toContainText("cleared");
  });
});

