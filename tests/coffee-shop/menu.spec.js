var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - menu filtering", function () {
  test("filters items by category and updates aria-pressed", async function ({ page }) {
    await page.goto("/demos/coffee-shop/menu.html");

    var oatLatte = page.locator("[data-item-id=\"oat-latte\"]");
    var chai = page.locator("[data-item-id=\"chai-citrus\"]");

    await expect(oatLatte).toBeVisible();
    await expect(chai).toBeVisible();

    await page.getByRole("button", { name: "Tea" }).click();
    await expect(page.getByRole("button", { name: "Tea" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Coffee" })).toHaveAttribute("aria-pressed", "false");

    await expect(oatLatte).toBeHidden();
    await expect(chai).toBeVisible();
  });

  test("preselects category from the query string", async function ({ page }) {
    await page.goto("/demos/coffee-shop/menu.html?category=coffee");
    await expect(page.getByRole("button", { name: "Coffee" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-item-id=\"chai-citrus\"]")).toBeHidden();
  });

  test("adds an item to the order inquiry", async function ({ page }) {
    await page.goto("/demos/coffee-shop/menu.html");
    var add = page.getByRole("button", { name: "Add to order inquiry" }).first();
    await expect(add).toBeVisible();
    await add.click();
    await expect(page.locator("[data-toast]")).toBeVisible();
  });
});
