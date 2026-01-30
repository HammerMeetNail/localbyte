var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("LaunchClock demo - generator", function () {
  test("editing fields updates preview and share link", async function ({ page }) {
    await page.goto("/demos/launchclock/index.html");

    var nameInput = page.locator("#event-name");
    await nameInput.fill("Launch Party");
    await expect(page.locator("[data-preview-root] .lc-title")).toHaveText("Launch Party");

    var shareValue = await page.inputValue("#share-url");
    var u = new URL(shareValue);
    expect(u.pathname).toContain("/demos/launchclock/countdown.html");
    expect(u.searchParams.get("name")).toBe("Launch Party");
    expect(u.searchParams.get("ts")).toBeTruthy();
  });

  test("copy link provides accessible feedback", async function ({ page }) {
    await page.goto("/demos/launchclock/index.html");
    await page.click("[data-copy-link]");
    await expect(page.locator("[data-share-status]")).not.toHaveText("");
  });

  test("open link opens a configured countdown page", async function ({ page, context }) {
    await page.goto("/demos/launchclock/index.html");
    await page.locator("#event-name").fill("Demo Countdown");

    var nextPagePromise = context.waitForEvent("page");
    await page.click("[data-open-link]");
    var countdown = await nextPagePromise;
    await countdown.waitForLoadState("domcontentloaded");

    await expect(countdown.locator(".lc-title")).toHaveText("Demo Countdown");
    await expect(countdown.locator(".lc-time-grid")).toHaveCount(1);
  });
});

