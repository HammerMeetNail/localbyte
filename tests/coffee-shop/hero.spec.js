var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

test.describe("Coffee shop demo - hero parallax", function () {
  test("moves the hero layer on scroll", async function ({ page }) {
    await page.goto("/demos/coffee-shop/index.html");

    var layer = page.locator("[data-hero-layer]");
    await expect(layer).toHaveCount(1);

    var initial = await layer.evaluate(function (el) {
      return window.getComputedStyle(el).transform;
    });

    await page.evaluate(function () {
      window.scrollTo(0, 500);
    });
    await page.waitForTimeout(50);

    var next = await layer.evaluate(function (el) {
      return window.getComputedStyle(el).transform;
    });

    expect(next).not.toBe(initial);
  });

  test.describe("reduced motion", function () {
    test.use({ reducedMotion: "reduce" });

    test("does not move the hero layer on scroll", async function ({ page }) {
      await page.goto("/demos/coffee-shop/index.html");

      var layer = page.locator("[data-hero-layer]");
      await expect(layer).toHaveCount(1);

      var initial = await layer.evaluate(function (el) {
        return window.getComputedStyle(el).transform;
      });

      await page.evaluate(function () {
        window.scrollTo(0, 500);
      });
      await page.waitForTimeout(50);

      var next = await layer.evaluate(function (el) {
        return window.getComputedStyle(el).transform;
      });

      expect(next).toBe(initial);
    });
  });
});

