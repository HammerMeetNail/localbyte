var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

var previews = ["juniper-yard", "goodform", "harbor-home", "northline",
  "fieldwork", "gatherwell", "nabu", "year-of-bingo", "coffee-shop", "finance-dashboard",
  "launchclock", "bytebites", "easy-email"];

async function expectPreviews(page, theme, names, selector) {
  var cards = page.locator(selector || ".work-visual");
  await expect(cards).toHaveCount(names.length);
  var frames = [];
  for (var i = 0; i < names.length; i++) {
    var card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    var fixedTheme = names[i] === "year-of-bingo" || names[i] === "easy-email";
    await expect(card.locator("img")).toHaveCount(fixedTheme ? 1 : 2);
    var image = card.locator("img:visible");
    await expect(image).toHaveCount(1);
    await expect(card.getByRole("img")).toHaveCount(1);
    await expect(image).toHaveAttribute("alt", /\S/);
    var filename = names[i] + (fixedTheme ? "" : "-" + theme) + ".webp";
    // Lazy images settle asynchronously after CSS makes the variant visible.
    // Check the chosen, decoded bitmap rather than only its display rule.
    await expect.poll(function () {
      return image.evaluate(function (img, expected) {
        return img.currentSrc && new URL(img.currentSrc).pathname.endsWith("/" + expected) && img.complete &&
          img.naturalWidth === 1280 && img.naturalHeight === 900;
      }, filename);
    }).toBe(true);
    await image.evaluate(function (img) { return img.decode(); });
    var frame = await card.boundingBox();
    expect(frame.width / frame.height).toBeCloseTo(1280 / 900, 2);
    expect(await card.evaluate(function (element) {
      return parseFloat(getComputedStyle(element).paddingTop);
    })).toBeGreaterThan(0);
    expect(await image.evaluate(function (img) { return getComputedStyle(img).objectFit; })).toBe("contain");
    await expect(card).toHaveAttribute("target", "_blank");
    await expect(card).toHaveAttribute("rel", "noreferrer");
    frames.push({ width: frame.width, height: frame.height });
  }
  return frames;
}

async function changeOSTheme(page, theme) {
  await page.evaluate(function () {
    window.previewMediaChangeObserved = false;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      window.previewMediaChangeObserved = true;
    }, { once: true });
  });
  await page.emulateMedia({ colorScheme: theme });
  // Also wait when an explicit preference should stay unchanged; an assertion
  // on the already-visible image alone could pass before the change event.
  await expect.poll(function () {
    return page.evaluate(function () { return window.previewMediaChangeObserved; });
  }).toBe(true);
}

[{ url: "/index.html", names: ["nabu", "year-of-bingo"] },
  { url: "/portfolio.html", names: previews }].forEach(function (fixture) {
  test("previews follow live OS theme and a saved keyboard choice on " + fixture.url, async function ({ page }) {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(fixture.url);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    var frames = await expectPreviews(page, "light", fixture.names);
    await changeOSTheme(page, "dark");
    expect(await expectPreviews(page, "dark", fixture.names)).toEqual(frames);
    var toggle = page.getByRole("button", { name: "Dark mode", exact: true });
    await toggle.focus();
    await toggle.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    expect(await expectPreviews(page, "light", fixture.names)).toEqual(frames);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectPreviews(page, "light", fixture.names);
    await changeOSTheme(page, "light");
    await changeOSTheme(page, "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectPreviews(page, "light", fixture.names);
  });
});

test("stored dark previews override light OS and survive reload", async function ({ page }) {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(function () { localStorage.setItem("theme", "dark"); });
  await page.goto("/portfolio.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectPreviews(page, "dark", previews);
  await page.reload();
  await expectPreviews(page, "dark", previews);
});

["light", "dark"].forEach(function (preference) {
  test("saved " + preference + " preview is correct before delayed theme script", async function ({ page }) {
    var releaseScript;
    var scriptRequested;
    var released = new Promise(function (resolve) { releaseScript = resolve; });
    var requested = new Promise(function (resolve) { scriptRequested = resolve; });
    await page.route("**/assets/js/theme.js?*", async function (route) {
      scriptRequested();
      await released;
      await route.continue();
    });
    await page.addInitScript(function (theme) { localStorage.setItem("theme", theme); }, preference);
    await page.emulateMedia({ colorScheme: preference === "light" ? "dark" : "light" });
    try {
      // Commit lets us inspect the real initial hash target while the parser's
      // footer script request is deliberately pending, before DOMContentLoaded.
      await page.goto("/portfolio.html#nabu", { waitUntil: "commit" });
      await requested;
      await expect(page.locator("html")).toHaveAttribute("data-theme", preference);
      await expectPreviews(page, preference, ["nabu"], "#nabu .work-visual");
    } finally {
      releaseScript();
    }
    await page.waitForLoadState("load");
    await expectPreviews(page, preference, ["nabu"], "#nabu .work-visual");
  });
});

test("cross-tab choices and clearing storage update every preview", async function ({ page, context }) {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/portfolio.html");
  await expectPreviews(page, "light", previews);
  var other = await context.newPage();
  await other.goto("/index.html");
  await other.evaluate(function () { localStorage.setItem("theme", "dark"); });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expectPreviews(page, "dark", previews);
  await other.evaluate(function () { localStorage.setItem("theme", "light"); });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expectPreviews(page, "light", previews);
  await changeOSTheme(page, "dark");
  await other.evaluate(function () { localStorage.clear(); });
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
  await expectPreviews(page, "dark", previews);
  await other.close();
});

["read", "write"].forEach(function (failure) {
  test("blocked storage " + failure + " keeps preview switching usable", async function ({ page }) {
    var errors = [];
    page.on("pageerror", function (error) { errors.push(error.message); });
    await page.addInitScript(function (failure) {
      if (failure === "read") {
        Object.defineProperty(window, "localStorage", {
          get: function () { throw new Error("Storage blocked for preview regression"); }
        });
      } else {
        Storage.prototype.setItem = function () { throw new Error("Storage write blocked for preview regression"); };
      }
    }, failure);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/portfolio.html");
    await expectPreviews(page, "dark", previews);
    await page.getByRole("button", { name: "Dark mode", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expectPreviews(page, "light", previews);
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    await expectPreviews(page, "dark", previews);
    expect(errors).toEqual([]);
  });
});

["light", "dark"].forEach(function (theme) {
  test("no-JS previews follow " + theme + " OS preference", async function ({ browser }) {
    var context = await browser.newContext({ javaScriptEnabled: false, colorScheme: theme });
    var page = await context.newPage();
    try {
      await page.goto("http://127.0.0.1:9000/portfolio.html");
      await expectPreviews(page, theme, previews);
      await expect(page.locator(".theme-toggle")).toBeHidden();
    } finally {
      await context.close();
    }
  });
});
