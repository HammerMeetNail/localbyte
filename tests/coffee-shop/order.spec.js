var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - order/reserve form", function () {
  test("shows validation errors on empty submit", async function ({ page }) {
    await page.goto("/demos/coffee-shop/order.html");

    await page.getByRole("button", { name: "Send request" }).click();

    var summary = page.locator("[data-error-summary]");
    await expect(summary).toBeVisible();
    await expect(page.locator("#pickup-time")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#order-items")).toHaveAttribute("aria-invalid", "true");
  });

  test("submits order mode with valid data and shows confirmation", async function ({ page }) {
    await page.goto("/demos/coffee-shop/order.html");

    await page.fill("#pickup-time", "10:30");
    await page.fill("#order-items", "1x Oat Latte");
    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");

    await page.getByRole("button", { name: "Send request" }).click();

    await expect(page.locator("[data-success]")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request received (demo)." })).toBeVisible();
  });

  test("blocks submission when honeypot is filled", async function ({ page }) {
    await page.goto("/demos/coffee-shop/order.html");

    await page.fill("#website", "spam");
    await page.fill("#pickup-time", "10:30");
    await page.fill("#order-items", "1x Oat Latte");
    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");

    await page.getByRole("button", { name: "Send request" }).click();

    await expect(page.locator("[data-success]")).toBeHidden();
    await expect(page.locator("[data-error-summary]")).toBeVisible();
    await expect(page.locator("[data-error-summary]")).toContainText("Submission blocked.");
  });
});

