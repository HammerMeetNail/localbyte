var test = require("@playwright/test").test;
var expect = require("@playwright/test").expect;
var fs = require("fs");
var path = require("path");

var draftKey = "localbyte-contact-draft";
var services = {
  "website": "Website",
  "single-page": "Single-page website",
  "business-website": "Business website",
  "business-plus": "Business Plus",
  "web-app": "Web App",
  "mobile-app": "Mobile App",
  "automation": "Automation",
  "discovery": "Discovery",
  "hosting": "Hosting",
  "website-care": "Website Care",
  "care-plus": "Care Plus",
  "application-care": "Application Care",
  "payment-plan": "Payment plan",
  "assessment": "Website assessment"
};

async function fillContact(page) {
  await page.locator('[name="name"]').fill("Contact regression");
  await page.locator('[name="email"]').fill("regression@example.invalid");
  await page.locator('[name="message"]').fill("Test inquiry intercepted locally.");
}

async function observeHistoryCache(page) {
  await page.addInitScript(function () {
    window.addEventListener("pageshow", function (event) {
      window.contactHistoryWasCached = event.persisted;
    });
  });
}

async function historyWasCached(page) {
  return page.evaluate(function () { return window.contactHistoryWasCached === true; });
}

Object.keys(services).forEach(function (slug) {
  test("preselects the allowlisted service " + slug, async function ({ page }) {
    await page.goto("/contact.html?service=" + slug);
    await expect(page.locator('select[name="service"]')).toHaveValue(services[slug]);
    await expect(page.locator('select[name="service"]')).not.toHaveAttribute("required", "");
    await expect(page.locator("#contact-draft-note")).toBeHidden();
    expect(await page.evaluate(function (key) { return sessionStorage.getItem(key); }, draftKey)).toBeNull();
  });
});

test("ignores unknown and inherited service identifiers", async function ({ page }) {
  for (var slug of ["not-a-service", "constructor", "__proto__", "Website", "<script>"]) {
    await page.goto("/contact.html?service=" + encodeURIComponent(slug));
    await expect(page.locator('select[name="service"]')).toHaveValue("Not sure");
    await expect(page.locator("#contact-draft-note")).toBeHidden();
  }
});

test("preserves edits across reload, pricing navigation, and a new contextual link", async function ({ page }) {
  await page.goto("/contact.html?service=single-page");
  await fillContact(page);
  await page.locator('[name="company"]').fill("Draft business");
  // Even the generic choice is an explicit choice that a later query must respect.
  await page.locator('select[name="service"]').selectOption("Not sure");
  await page.reload();
  await expect(page.locator('[name="message"]')).toHaveValue("Test inquiry intercepted locally.");
  await page.getByRole("link", { name: "See our packages and pricing." }).click();
  await expect(page).toHaveURL(/\/pricing\.html$/);
  await page.goto("/contact.html?service=business-plus");
  await expect(page.locator('[name="name"]')).toHaveValue("Contact regression");
  await expect(page.locator('[name="email"]')).toHaveValue("regression@example.invalid");
  await expect(page.locator('[name="company"]')).toHaveValue("Draft business");
  await expect(page.locator('[name="message"]')).toHaveValue("Test inquiry intercepted locally.");
  await expect(page.locator('select[name="service"]')).toHaveValue("Not sure");
  expect(page.url()).not.toContain("regression");
});

test("a later contextual link wins until the visitor edits or chooses a service", async function ({ page }) {
  await page.goto("/contact.html?service=web-app");
  await page.goto("/contact.html?service=mobile-app");
  await expect(page.locator('select[name="service"]')).toHaveValue("Mobile App");
  await page.locator('select[name="service"]').selectOption("Web App");
  await page.goto("/contact.html?service=mobile-app");
  await expect(page.locator('select[name="service"]')).toHaveValue("Web App");
});

test("Back restores the latest draft across older contact history entries", async function ({ page }) {
  await observeHistoryCache(page);
  await page.goto("/contact.html?service=web-app");
  await fillContact(page);
  await page.getByRole("link", { name: "See our packages and pricing." }).click();
  await page.goto("/contact.html?service=mobile-app");
  await page.locator('[name="message"]').fill("Newer history draft");
  await page.goBack();
  await expect(page).toHaveURL(/\/pricing\.html$/);
  await page.goBack();
  await expect(page.locator('[name="message"]')).toHaveValue("Newer history draft");
  if (!await historyWasCached(page)) {
    test.info().annotations.push({ type: "history", description: "BFCache unavailable; also exercise persisted pageshow with stale form state." });
    await page.evaluate(function () {
      document.querySelector('[name="message"]').value = "Older cached draft";
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });
    await expect(page.locator('[name="message"]')).toHaveValue("Newer history draft");
  }
});

test("ignores malformed or invalid stored drafts and recovers on edit", async function ({ page }) {
  for (var raw of ["{broken", "null", '{"version":1,"fields":{"service":"Unknown"}}',
    '{"version":1,"fields":{"name":{},"email":"","company":"","service":"Not sure","message":""}}']) {
    // Seed away from the form so its pagehide save cannot replace the fixture.
    await page.goto("/pricing.html");
    await page.evaluate(function (args) {
      sessionStorage.setItem(args.key, args.raw);
    }, { key: draftKey, raw: raw });
    await page.goto("/contact.html?service=discovery");
    await expect(page.locator('select[name="service"]')).toHaveValue("Discovery");
    await expect(page.locator('[name="name"]')).toHaveValue("");
    await page.locator('[name="name"]').fill("Recovered draft");
    await page.reload();
    await expect(page.locator('[name="name"]')).toHaveValue("Recovered draft");
  }
});

test("blocked session storage leaves contextual selection and the form usable", async function ({ page }) {
  var errors = [];
  page.on("pageerror", function (error) { errors.push(error.message); });
  await page.addInitScript(function () {
    Object.defineProperty(window, "sessionStorage", {
      get: function () { throw new Error("Storage blocked for regression test"); }
    });
  });
  await page.goto("/contact.html?service=automation");
  await expect(page.locator('select[name="service"]')).toHaveValue("Automation");
  await fillContact(page);
  await expect(page.locator("#contact-draft-note")).toBeHidden();
  expect(await page.locator('form[name="contact"]').evaluate(function (form) {
    return form.checkValidity();
  })).toBe(true);
  expect(errors).toEqual([]);
});

test("a storage write failure does not promise retention or break edits", async function ({ page }) {
  await page.addInitScript(function () {
    Storage.prototype.setItem = function () { throw new Error("Quota exceeded for regression test"); };
  });
  await page.goto("/contact.html?service=hosting");
  await fillContact(page);
  await expect(page.locator('select[name="service"]')).toHaveValue("Hosting");
  await expect(page.locator("#contact-draft-note")).toBeHidden();
  await page.reload();
  await expect(page.locator('[name="message"]')).toHaveValue("");
});

test("storage failure after a saved draft protects newer cached in-memory edits", async function ({ page }) {
  await observeHistoryCache(page);
  await page.goto("/contact.html");
  await fillContact(page);
  await page.reload();
  async function makeUnsavedEdit() {
    await page.evaluate(function (key) {
      var original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw new Error("Draft write blocked after initial save");
        return original.call(this, name, value);
      };
    }, draftKey);
    await page.locator('[name="message"]').fill("Newer unsaved edit");
    await expect(page.locator("#contact-draft-note")).toBeHidden();
  }
  await makeUnsavedEdit();
  await page.getByRole("link", { name: "See our packages and pricing." }).click();
  await page.goBack();
  if (!await historyWasCached(page)) {
    test.info().annotations.push({ type: "history", description: "BFCache unavailable; recreate failed write and exercise persisted pageshow." });
    await makeUnsavedEdit();
    await page.evaluate(function () {
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });
  }
  // Let the history callback settle before asserting an already-visible value.
  await page.evaluate(function () {
    return new Promise(function (resolve) { window.setTimeout(resolve, 0); });
  });
  await expect(page.locator('[name="message"]')).toHaveValue("Newer unsaved edit");
  await expect(page.locator("#contact-draft-note")).toBeHidden();
  var stored = await page.evaluate(function (key) { return JSON.parse(sessionStorage.getItem(key)); }, draftKey);
  expect(stored.fields.message).toBe("Test inquiry intercepted locally.");
});

test("editing cancels a pending history reconciliation before it can restore stale storage", async function ({ page }) {
  await page.goto("/contact.html");
  await fillContact(page);
  await page.evaluate(function (key) {
    Storage.prototype.setItem = function () { throw new Error("Storage now unwritable"); };
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    var message = document.querySelector('[name="message"]');
    message.value = "Edit while history restoration is scheduled";
    message.dispatchEvent(new Event("input", { bubbles: true }));
    return new Promise(function (resolve) { window.setTimeout(resolve, 0); });
  }, draftKey);
  await expect(page.locator('[name="message"]')).toHaveValue("Edit while history restoration is scheduled");
  await expect(page.locator("#contact-draft-note")).toBeHidden();
});

["input", "submit", "pagehide"].forEach(function (eventName) {
  test("pending history reconciliation is canceled on " + eventName, async function ({ page }) {
    await page.route("**/thanks.html", function (route) { return route.abort(); });
    await page.goto("/contact.html");
    await fillContact(page);
    var result = await page.evaluate(async function (args) {
      var eventName = args.eventName;
      var originalSetTimeout = window.setTimeout;
      var scheduled = 0;
      var ran = false;
      if (eventName === "pagehide") {
        var newerDraft = JSON.parse(sessionStorage.getItem(args.key));
        newerDraft.fields.message = "New shared draft awaiting history reconciliation";
        sessionStorage.setItem(args.key, JSON.stringify(newerDraft));
      }
      window.setTimeout = function (callback, delay) {
        scheduled++;
        return originalSetTimeout(function () {
          ran = true;
          callback();
        }, delay);
      };
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
      window.setTimeout = originalSetTimeout;
      var target = eventName === "pagehide" ? window :
        document.querySelector(eventName === "submit" ? 'form[name="contact"]' : '[name="message"]');
      target.dispatchEvent(new Event(eventName, { bubbles: true, cancelable: true }));
      await new Promise(function (resolve) { originalSetTimeout(resolve, 0); });
      return {
        scheduled: scheduled,
        ran: ran,
        storedMessage: JSON.parse(sessionStorage.getItem(args.key)).fields.message
      };
    }, { eventName: eventName, key: draftKey });
    expect(result).toEqual({
      scheduled: 1,
      ran: false,
      storedMessage: eventName === "pagehide" ? "New shared draft awaiting history reconciliation" :
        "Test inquiry intercepted locally."
    });
    await expect(page).toHaveURL(/\/contact\.html$/);
  });
});

test("native validation prevents empty and invalid-email submissions", async function ({ page }) {
  var requests = [];
  await page.route("**/thanks.html", function (route) {
    if (route.request().method() === "POST") {
      requests.push(route.request());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/contact.html");
  await page.getByRole("button", { name: "Send your message" }).click();
  expect(await page.locator('[name="name"]').evaluate(function (field) {
    return field.validity.valueMissing;
  })).toBe(true);
  await fillContact(page);
  await page.locator('[name="email"]').fill("invalid-email");
  await page.getByRole("button", { name: "Send your message" }).click();
  expect(await page.locator('[name="email"]').evaluate(function (field) {
    return field.validity.typeMismatch;
  })).toBe(true);
  expect(requests).toEqual([]);
  await expect(page).toHaveURL(/\/contact\.html$/);
});

test("preserves the native POST contract and draft after a failed submission", async function ({ page }) {
  await page.route("**/thanks.html", function (route) {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 500, contentType: "text/html", body: "<h1>Test failure</h1>" });
    }
    return route.continue();
  });
  await page.goto("/contact.html");
  var form = page.locator('form[name="contact"]');
  await expect(form).toHaveAttribute("method", "post");
  await expect(form).toHaveAttribute("action", "thanks.html");
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
  for (var name of ["name", "email", "message"]) {
    await expect(form.locator('[name="' + name + '"]')).toHaveAttribute("required", "");
  }
  for (var optional of ["service", "company"]) {
    expect(await form.locator('[name="' + optional + '"]').evaluate(function (field) {
      return field.required;
    })).toBe(false);
  }
  await fillContact(page);
  var sent = page.waitForRequest(function (request) {
    return request.method() === "POST" && new URL(request.url()).pathname === "/thanks.html";
  });
  await page.getByRole("button", { name: "Send your message" }).click();
  var request = await sent;
  var fields = new URLSearchParams(request.postData());
  expect(request.headers()["content-type"]).toContain("application/x-www-form-urlencoded");
  expect(fields.get("form-name")).toBe("contact");
  expect(fields.get("bot-field")).toBe("");
  expect(fields.get("name")).toBe("Contact regression");
  expect(fields.get("email")).toBe("regression@example.invalid");
  expect(fields.get("company")).toBe("");
  expect(fields.get("service")).toBe("Not sure");
  expect(fields.get("message")).toBe("Test inquiry intercepted locally.");
  await expect(page.getByRole("heading", { name: "Test failure" })).toBeVisible();
  await page.goto("/contact.html?service=assessment");
  await expect(page.locator('[name="message"]')).toHaveValue("Test inquiry intercepted locally.");
  await expect(page.locator('select[name="service"]')).toHaveValue("Not sure");
  expect(await page.evaluate(function (key) { return sessionStorage.getItem(key + "-submitted"); }, draftKey)).toBeNull();
  await page.locator('[name="message"]').fill("New draft after failed submission");
  await page.goto("/thanks.html");
  await page.reload();
  var stored = await page.evaluate(function (key) { return JSON.parse(sessionStorage.getItem(key)); }, draftKey);
  expect(stored.fields.message).toBe("New draft after failed submission");
});

test("clears a submitted draft after Skip to content and preserves later drafts", async function ({ page }) {
  var thanksHtml = fs.readFileSync(path.join(__dirname, "../../public/thanks.html"), "utf8");
  await page.route("**/thanks.html", function (route) {
    if (route.request().method() === "POST") {
      // Exercise arrival at the real success document; keep every POST intercepted.
      return route.fulfill({ status: 200, contentType: "text/html", body: thanksHtml });
    }
    return route.continue();
  });
  await page.goto("/contact.html?service=website-care");
  var skipLink = page.getByRole("link", { name: "Skip to content" });
  await skipLink.focus();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/\/contact\.html\?service=website-care#main$/);
  await fillContact(page);
  expect(await page.evaluate(function (key) { return sessionStorage.getItem(key); }, draftKey)).not.toBeNull();
  await page.getByRole("button", { name: "Send your message" }).click();
  await expect(page.getByRole("heading", { name: "Thanks for saying hello." })).toBeVisible();
  await expect.poll(function () {
    return page.evaluate(function (key) { return sessionStorage.getItem(key); }, draftKey);
  }).toBeNull();
  await page.goBack();
  await expect(page.locator('[name="message"]')).toHaveValue("");
  await expect(page.locator('select[name="service"]')).toHaveValue("Website Care");
  expect(await page.evaluate(function (key) { return sessionStorage.getItem(key + "-submitted"); }, draftKey)).toBeNull();
  await fillContact(page);
  await page.locator('[name="message"]').fill("New unsent draft after success");
  await page.goForward();
  await expect(page.getByRole("heading", { name: "Thanks for saying hello." })).toBeVisible();
  var stored = await page.evaluate(function (key) { return JSON.parse(sessionStorage.getItem(key)); }, draftKey);
  expect(stored.fields.message).toBe("New unsent draft after success");
  await page.reload();
  stored = await page.evaluate(function (key) { return JSON.parse(sessionStorage.getItem(key)); }, draftKey);
  expect(stored.fields.message).toBe("New unsent draft after success");
  await page.goto("/thanks.html");
  stored = await page.evaluate(function (key) { return JSON.parse(sessionStorage.getItem(key)); }, draftKey);
  expect(stored.fields.message).toBe("New unsent draft after success");
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.locator('[name="message"]')).toHaveValue("New unsent draft after success");
});

test("clears the submitted draft from the hosted clean contact path after Skip to content", async function ({ page }) {
  var contactHtml = fs.readFileSync(path.join(__dirname, "../../public/contact.html"), "utf8");
  var thanksHtml = fs.readFileSync(path.join(__dirname, "../../public/thanks.html"), "utf8");
  var postUrls = [];
  await page.route("**/*", function (route) {
    var request = route.request();
    var pathname = new URL(request.url()).pathname;
    if (request.method() === "POST") {
      // Intercept every POST, including an unexpected action destination.
      postUrls.push(request.url());
      if (pathname !== "/thanks.html") return route.abort();
      return route.fulfill({ status: 200, contentType: "text/html", body: thanksHtml });
    }
    if (pathname === "/contact") {
      return route.fulfill({ status: 200, contentType: "text/html", body: contactHtml });
    }
    return route.continue();
  });
  await page.goto("/contact?service=website-care");
  await expect(page.locator('select[name="service"]')).toHaveValue("Website Care");
  var skipLink = page.getByRole("link", { name: "Skip to content" });
  await skipLink.focus();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/\/contact\?service=website-care#main$/);
  await fillContact(page);
  expect(await page.evaluate(function (key) { return sessionStorage.getItem(key); }, draftKey)).not.toBeNull();
  await page.getByRole("button", { name: "Send your message" }).click();
  await expect(page.getByRole("heading", { name: "Thanks for saying hello." })).toBeVisible();
  expect(postUrls.length).toBe(1);
  expect(new URL(postUrls[0]).pathname).toBe("/thanks.html");
  expect(await page.evaluate(function () { return new URL(document.referrer).pathname; })).toBe("/contact");
  await expect.poll(function () {
    return page.evaluate(function (key) { return sessionStorage.getItem(key); }, draftKey);
  }).toBeNull();
  expect(await page.evaluate(function (key) { return sessionStorage.getItem(key + "-submitted"); }, draftKey)).toBeNull();
});
