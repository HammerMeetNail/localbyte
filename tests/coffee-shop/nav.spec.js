var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - mobile navigation", function () {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens and closes the mobile menu", async function ({ page }) {
    await page.goto("/demos/coffee-shop/index.html");

    var menuButton = page.getByRole("button", { name: "Menu" });
    var nav = page.locator("#nav-menu");

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toHaveClass(/open/);

    await page.keyboard.press("Escape");
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(nav).not.toHaveClass(/open/);
  });

  test("closes when clicking outside", async function ({ page }) {
    await page.goto("/demos/coffee-shop/index.html");

    var menuButton = page.getByRole("button", { name: "Menu" });
    var nav = page.locator("#nav-menu");

    await menuButton.click();
    await expect(nav).toHaveClass(/open/);

    await page.click("body", { position: { x: 10, y: 10 } });
    await expect(nav).not.toHaveClass(/open/);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("closes after clicking a nav link", async function ({ page }) {
    await page.goto("/demos/coffee-shop/index.html");

    var menuButton = page.getByRole("button", { name: "Menu" });
    var nav = page.locator("#nav-menu");

    await menuButton.click();
    await expect(nav).toHaveClass(/open/);

    await page.getByRole("link", { name: "Menu" }).click();
    await expect(nav).not.toHaveClass(/open/);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});

