var test = require("node:test");
var assert = require("node:assert/strict");
var fs = require("fs");
var os = require("os");
var path = require("path");
var spawnSync = require("child_process").spawnSync;
var pricing = require("../../scripts/sync-pricing.js");
var config = require("../../config/pricing.json");
// Fixed arithmetic examples remain independent of future published price changes.
var fixtureConfig = Object.assign({}, config, {
  starter: 995,
  businessPlus: 3495,
  assessment: 300,
  planInitial: 495,
  planBuildMonthly: 130,
  websiteCare: 99,
  planMonths: 12
});

function markedHtml() {
  var amounts = Object.assign({}, fixtureConfig, {
    planMonthly: 229,
    planBuildTotal: 2055,
    planTotal: 3243
  });
  delete amounts.planMonths;
  return "<h1>Static pricing</h1>\n" + Object.keys(amounts).map(function (key) {
    return '<span data-price="' + key + '">$' + amounts[key].toLocaleString("en-US") + "</span>";
  }).join("\n") + "\n<span data-pricing-months>12</span>\n<p>Unmarked copy is preserved.</p>";
}

test("committed static pricing amounts and payment duration match the central config", function () {
  var html = fs.readFileSync(path.join(__dirname, "../../public/pricing.html"), "utf8");
  assert.deepEqual(pricing.syncPricing(html, config).staleKeys, [], "Run npm run pricing:sync after editing pricing config.");
});

test("payment totals include care in monthly and overall cost, but exclude it from build cost", function () {
  var values = pricing.pricingValues(fixtureConfig);
  assert.equal(values.planMonthly, 229);
  assert.equal(values.planBuildTotal, 2055);
  assert.equal(values.planTotal, 3243);
  var oneMonth = pricing.pricingValues(Object.assign({}, fixtureConfig, { planMonths: 1 }));
  assert.equal(oneMonth.planBuildTotal, 625);
  assert.equal(oneMonth.planTotal, 724);
  var changedCare = pricing.pricingValues(Object.assign({}, fixtureConfig, { websiteCare: 199 }));
  assert.equal(changedCare.planMonthly, 329);
  assert.equal(changedCare.planBuildTotal, 2055);
  assert.equal(changedCare.planTotal, 4443);
});

test("invalid, missing, unknown, and overflowing config values are rejected", function () {
  [-1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1, undefined].forEach(function (starter) {
    assert.throws(function () {
      pricing.pricingValues(Object.assign({}, fixtureConfig, { starter: starter }));
    }, /starter.*nonnegative safe integer/);
  });
  [0, -1, 1.5].forEach(function (months) {
    assert.throws(function () {
      pricing.pricingValues(Object.assign({}, fixtureConfig, { planMonths: months }));
    }, /planMonths.*positive safe integer/);
  });
  assert.throws(function () {
    pricing.pricingValues(Object.assign({}, fixtureConfig, { accidentalAmount: 50 }));
  }, /Unknown pricing config key: accidentalAmount/);
  assert.throws(function () {
    pricing.pricingValues(Object.assign({}, fixtureConfig, { planBuildMonthly: Number.MAX_SAFE_INTEGER }));
  }, /Derived pricing value.*safe integer precision/);
});

test("sync updates repeated stale amounts and payment terms without changing surrounding markup", function () {
  var html = markedHtml().replace('<span data-price="starter">$995</span>', '<span data-price="starter">$100</span>')
    .replace("<span data-pricing-months>12</span>", "<span data-pricing-months>6</span>");
  html += '\n<span data-price="starter">$1</span>\n<span data-pricing-months>24</span>';
  var result = pricing.syncPricing(html, fixtureConfig);
  assert.deepEqual(result.staleKeys, ["starter", "planMonths"]);
  assert.equal(result.html, markedHtml() + '\n<span data-price="starter">$995</span>\n<span data-pricing-months>12</span>');
  assert.match(result.html, /<span data-price="businessPlus">\$3,495<\/span>/);
  assert.match(result.html, /<span data-price="planBuildTotal">\$2,055<\/span>/);
  assert.deepEqual(pricing.syncPricing(result.html, fixtureConfig).staleKeys, []);
});

test("sync rejects unknown price keys and missing required amount or duration markers", function () {
  assert.throws(function () {
    pricing.syncPricing(markedHtml() + '<span data-price="constructor">$1</span>', fixtureConfig);
  }, /Unknown data-price key: constructor/);
  assert.throws(function () {
    pricing.syncPricing(markedHtml().replace('<span data-price="assessment">$300</span>', ""), fixtureConfig);
  }, /Missing data-price markers: assessment/);
  assert.throws(function () {
    pricing.syncPricing(markedHtml().replace('<span data-price="planTotal">$3,243</span>', ""), fixtureConfig);
  }, /Missing data-price markers: planTotal/);
  assert.throws(function () {
    pricing.syncPricing(markedHtml().replace("<span data-pricing-months>12</span>", ""), fixtureConfig);
  }, /Missing data-pricing-months marker/);
});

test("CLI check fails read-only on stale values, then sync produces a passing static file", function () {
  var root = fs.mkdtempSync(path.join(os.tmpdir(), "localbyte-pricing-"));
  try {
    ["scripts", "config", "public"].forEach(function (directory) {
      fs.mkdirSync(path.join(root, directory));
    });
    var script = path.join(root, "scripts/sync-pricing.js");
    var htmlPath = path.join(root, "public/pricing.html");
    fs.copyFileSync(path.join(__dirname, "../../scripts/sync-pricing.js"), script);
    fs.writeFileSync(path.join(root, "config/pricing.json"), JSON.stringify(fixtureConfig));
    var stale = markedHtml().replace("$995", "$10").replace(">12</span>", ">6</span>");
    fs.writeFileSync(htmlPath, stale);
    var check = spawnSync(process.execPath, [script, "--check"], { encoding: "utf8" });
    assert.equal(check.status, 1);
    assert.match(check.stderr, /Stale pricing values: starter, planMonths/);
    assert.equal(fs.readFileSync(htmlPath, "utf8"), stale);
    var sync = spawnSync(process.execPath, [script], { encoding: "utf8" });
    assert.equal(sync.status, 0, sync.stderr);
    assert.equal(fs.readFileSync(htmlPath, "utf8"), markedHtml());
    check = spawnSync(process.execPath, [script, "--check"], { encoding: "utf8" });
    assert.equal(check.status, 0, check.stderr);
    var unknown = markedHtml() + '<span data-price="unexpected">$10</span>';
    fs.writeFileSync(htmlPath, unknown);
    sync = spawnSync(process.execPath, [script], { encoding: "utf8" });
    assert.equal(sync.status, 1);
    assert.match(sync.stderr, /Unknown data-price key: unexpected/);
    assert.equal(fs.readFileSync(htmlPath, "utf8"), unknown);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
