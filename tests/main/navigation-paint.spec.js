var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;

function signal() {
  var resolve;
  var promise = new Promise(function (done) { resolve = done; });
  return { promise: promise, resolve: resolve };
}

async function within(promise, description) {
  var timer;
  try {
    return await Promise.race([promise, new Promise(function (_, reject) {
      timer = setTimeout(function () { reject(new Error("Timed out waiting for " + description)); }, 5000);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

test.beforeEach(async function ({ page }) {
  // These checks concern shell state, independent of the external font service.
  await page.route("https://fonts.googleapis.com/**", function (route) { return route.abort(); });
});

test("mobile navigation keeps the outgoing header steady until the destination arrives", async function ({ page }) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  var menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.click();
  var before = await page.locator(".site-header").boundingBox();
  var clicked = signal();
  await page.exposeBinding("reportNavigationClick", function (_, state) { clicked.resolve(state); });
  await page.evaluate(function () {
    document.addEventListener("click", function (event) {
      var link = event.target.closest(".nav-links a");
      if (!link || new URL(link.href).pathname !== "/pricing.html") return;
      // Document bubbling runs after the shared navigation handler. Capture
      // here: browser evaluations can block once a document navigation starts.
      window.reportNavigationClick({
        headerHeight: document.querySelector(".site-header").getBoundingClientRect().height,
        open: document.querySelector(".nav-links").classList.contains("open"),
        expanded: document.querySelector(".menu-toggle").getAttribute("aria-expanded")
      });
    });
  });
  var requested = signal();
  var release = signal();
  await page.route("**/pricing.html", async function (route) {
    requested.resolve();
    await release.promise;
    await route.continue();
  });
  var click = page.locator(".nav-links").getByRole("link", { name: "Pricing", exact: true }).click({ noWaitAfter: true });
  // Attach a rejection handler immediately; the destination is deliberately held.
  var clickResult = click.then(function () { return null; }, function (error) { return error; });
  try {
    var state = await within(clicked.promise, "outgoing navigation click capture");
    await within(requested.promise, "destination request");
    await test.info().attach("outgoing-header-geometry", {
      body: Buffer.from(JSON.stringify({ beforeClick: before, whileDestinationPending: state }, null, 2)),
      contentType: "application/json"
    });
    expect(state.open).toBe(true);
    expect(state.expanded).toBe("true");
    expect(state.headerHeight).toBeCloseTo(before.height, 2);
  } finally {
    release.resolve();
    var clickError = await within(clickResult, "released navigation click");
    if (clickError) throw clickError;
  }
  await expect(page).toHaveURL(/\/pricing\.html$/);
  await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".nav-links")).toBeHidden();
  await test.info().attach("destination-header-geometry", {
    body: Buffer.from(JSON.stringify(await page.locator(".site-header").boundingBox(), null, 2)),
    contentType: "application/json"
  });
});

test("mobile local actions dismiss the menu and preserve focus", async function ({ page }) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  var menu = page.locator(".menu-toggle");
  var nav = page.locator(".nav-links");
  var firstLink = nav.getByRole("link", { name: "Services", exact: true, includeHidden: true });
  await menu.click();
  await expect(firstLink).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator("h1").click();
  await expect(nav).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await firstLink.evaluate(function (link) { link.setAttribute("href", "#main"); });
  await firstLink.click();
  await expect(page).toHaveURL(/\/index\.html#main$/);
  await expect(nav).toBeHidden();
  // Native fragment navigation owns the final focus target after dismissal.
  await expect(firstLink).not.toBeFocused();
  await menu.click();
  await firstLink.evaluate(function (link) { link.setAttribute("href", "#"); });
  await firstLink.click();
  await expect(page).toHaveURL(/\/index\.html#$/);
  await expect(nav).toBeHidden();
  await expect(firstLink).not.toBeFocused();
  await menu.click();
  await firstLink.evaluate(function (link) {
    link.setAttribute("href", "services.html");
    link.addEventListener("click", function (event) { event.preventDefault(); }, { once: true });
  });
  await firstLink.click();
  await expect(nav).toBeHidden();
  await expect(page).toHaveURL(/\/index\.html#$/);
});

test("keyboard new-tab navigation dismisses the menu and restores focus", async function ({ page }) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator(".menu-toggle").click();
  var link = page.locator(".nav-links").getByRole("link", { name: "Pricing", exact: true });
  await link.evaluate(function (link) { link.setAttribute("target", "_blank"); });
  await link.focus();
  await expect(link).toBeFocused();
  // Observe both operations immediately, including their failure paths. A key
  // failure must still close a popup that opened before that failure surfaced.
  var popup = page.waitForEvent("popup", { timeout: 5000 }).then(function (other) {
    return { page: other };
  }, function (error) { return { error: error }; });
  var activation = link.press("Enter", { timeout: 5000 }).then(function () {
    return null;
  }, function (error) { return error; });
  try {
    var results = await Promise.all([popup, activation]);
    if (results[0].error) throw results[0].error;
    if (results[1]) throw results[1];
    await expect(page.locator(".nav-links")).toBeHidden();
    await expect(page.locator(".menu-toggle")).toBeFocused();
    await expect(page).toHaveURL(/\/index\.html$/);
  } finally {
    var result = await popup;
    if (result.page) await result.page.close();
  }
});

test("history restoration dismisses a cached outgoing menu", async function ({ page }) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(function () {
    window.addEventListener("pageshow", function (event) { window.navigationHistoryWasCached = event.persisted; });
  });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  await page.locator(".menu-toggle").click();
  await page.locator(".nav-links").getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page).toHaveURL(/\/pricing\.html$/);
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/index\.html$/);
  await expect(page.locator(".nav-links")).toBeHidden();
  if (!await page.evaluate(function () { return window.navigationHistoryWasCached === true; })) {
    test.info().annotations.push({ type: "history", description: "BFCache unavailable; also exercise persisted pageshow with an expanded focused menu." });
    await page.locator(".menu-toggle").click();
    await expect(page.locator(".nav-links a").first()).toBeFocused();
    await page.evaluate(function () { window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })); });
    await expect(page.locator(".nav-links")).toBeHidden();
    await expect(page.locator(".menu-toggle")).toBeFocused();
  }
  await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "false");
});

test("breakpoint changes retain access to the focused navigation control", async function ({ page }) {
  await page.setViewportSize({ width: 1200, height: 844 });
  await page.goto("/index.html", { waitUntil: "domcontentloaded" });
  var firstLink = page.locator(".nav-links a").first();
  var menu = page.locator(".menu-toggle");
  await firstLink.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(firstLink).toBeVisible();
  await expect(firstLink).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page.setViewportSize({ width: 1200, height: 844 });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(firstLink).toBeFocused();
  await expect(menu).toBeHidden();
});

test.describe("touch previews", function () {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: "dark" });

  test("a touchscreen tap does not enlarge the preview when hover sticks", async function ({ page }) {
    await page.goto("/services.html", { waitUntil: "domcontentloaded" });
    var preview = page.locator("a.work-visual");
    await preview.evaluate(function (link) {
      // Exercise the real tap and its hover state without opening a demo tab.
      link.addEventListener("click", function (event) { event.preventDefault(); });
    });
    await preview.tap();
    await expect.poll(function () {
      return preview.evaluate(function (link) { return link.matches(":hover"); });
    }).toBe(true);
    await expect(preview.locator("img:visible")).toHaveCSS("transform", "none");
  });
});

test("desktop pointer hover still enlarges the preview", async function ({ page }) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/services.html", { waitUntil: "domcontentloaded" });
  var preview = page.locator("a.work-visual");
  await preview.hover();
  await expect.poll(function () {
    return preview.locator("img:visible").evaluate(function (image) {
      return new DOMMatrixReadOnly(getComputedStyle(image).transform).a;
    });
  }).toBeCloseTo(1.025, 3);
});

[
  { name: "saved dark", stored: "dark", os: "light", effective: "dark" },
  { name: "OS dark", stored: null, os: "dark", effective: "dark" },
  { name: "saved light over OS dark", stored: "light", os: "dark", effective: "light" }
].forEach(function (fixture) {
  test(fixture.name + " icon matches the initial theme before the footer script arrives", async function ({ page }) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: fixture.os });
    await page.addInitScript(function (stored) {
      if (stored) localStorage.setItem("theme", stored);
      else localStorage.removeItem("theme");
    }, fixture.stored);
    var requested = signal();
    var release = signal();
    await page.route("**/assets/js/theme.js?*", async function (route) {
      requested.resolve();
      await release.promise;
      await route.continue();
    });
    var visibleIcon = fixture.effective === "dark" ? ".icon-sun" : ".icon-moon";
    var hiddenIcon = fixture.effective === "dark" ? ".icon-moon" : ".icon-sun";
    try {
      await page.goto("/index.html", { waitUntil: "commit" });
      await within(requested.promise, "delayed theme script request");
      if (fixture.stored) await expect(page.locator("html")).toHaveAttribute("data-theme", fixture.stored);
      else await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
      await expect(page.locator(".theme-toggle " + visibleIcon)).toBeVisible({ timeout: 3000 });
      await expect(page.locator(".theme-toggle " + hiddenIcon)).toBeHidden();
    } finally {
      release.resolve();
    }
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator(".theme-toggle " + visibleIcon)).toBeVisible();
    await expect(page.locator(".theme-toggle")).toHaveAttribute("aria-pressed", fixture.effective === "dark" ? "true" : "false");
  });
});
