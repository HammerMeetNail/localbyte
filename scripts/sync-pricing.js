"use strict";

var fs = require("fs");
var path = require("path");
var sourceKeys = [
  "starter", "business", "businessPlus", "webApp", "discovery", "hosting",
  "websiteCare", "carePlus", "applicationCare", "additionalPage",
  "integrationMin", "integrationMax", "developmentHourly", "assessment",
  "planInitial", "planBuildMonthly"
];

function pricingValues(config) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Pricing config must be an object.");
  }
  var configKeys = sourceKeys.concat(["planMonths"]);
  Object.keys(config).forEach(function (key) {
    if (configKeys.indexOf(key) === -1) throw new Error("Unknown pricing config key: " + key);
  });
  var values = {};
  sourceKeys.forEach(function (key) {
    if (!Number.isSafeInteger(config[key]) || config[key] < 0) {
      throw new Error("Pricing value " + key + " must be a nonnegative safe integer.");
    }
    values[key] = config[key];
  });
  if (!Number.isSafeInteger(config.planMonths) || config.planMonths <= 0) {
    throw new Error("planMonths must be a positive safe integer.");
  }
  values.planMonthly = config.planBuildMonthly + config.websiteCare;
  values.planBuildTotal = config.planInitial + config.planBuildMonthly * config.planMonths;
  values.planTotal = config.planInitial + values.planMonthly * config.planMonths;
  ["planMonthly", "planBuildTotal", "planTotal"].forEach(function (key) {
    if (!Number.isSafeInteger(values[key])) {
      throw new Error("Derived pricing value " + key + " exceeds safe integer precision.");
    }
  });
  return values;
}

function formatPrice(value) {
  return "$" + value.toLocaleString("en-US");
}

function syncPricing(html, config) {
  var values = pricingValues(config);
  var seen = {};
  var staleKeys = [];
  var monthsFound = false;

  function noteStale(key) {
    if (staleKeys.indexOf(key) === -1) staleKeys.push(key);
  }

  var updated = html.replace(/<span data-price="([^"]*)">([^<]*)<\/span>/g, function (span, key, text) {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error("Unknown data-price key: " + key);
    }
    seen[key] = true;
    var expected = formatPrice(values[key]);
    if (text !== expected) noteStale(key);
    return '<span data-price="' + key + '">' + expected + "</span>";
  });
  updated = updated.replace(/<span data-pricing-months>([^<]*)<\/span>/g, function (span, text) {
    monthsFound = true;
    var expected = String(config.planMonths);
    if (text !== expected) noteStale("planMonths");
    return "<span data-pricing-months>" + expected + "</span>";
  });

  var missing = Object.keys(values).filter(function (key) { return !seen[key]; });
  if (missing.length) throw new Error("Missing data-price markers: " + missing.join(", "));
  if (!monthsFound) throw new Error("Missing data-pricing-months marker for the payment term.");
  return { html: updated, staleKeys: staleKeys };
}

function main() {
  var args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    throw new Error("Usage: node scripts/sync-pricing.js [--check]");
  }
  var root = path.resolve(__dirname, "..");
  var config = JSON.parse(fs.readFileSync(path.join(root, "config/pricing.json"), "utf8"));
  var pricingPath = path.join(root, "public/pricing.html");
  var html = fs.readFileSync(pricingPath, "utf8");
  var result = syncPricing(html, config);
  if (args[0] === "--check" && result.staleKeys.length) {
    throw new Error("Stale pricing values: " + result.staleKeys.join(", ") + ". Run npm run pricing:sync.");
  }
  if (args[0] !== "--check" && result.html !== html) {
    fs.writeFileSync(pricingPath, result.html);
    console.log("Updated marked pricing values in public/pricing.html.");
  } else {
    console.log("Pricing values and payment term are up to date.");
  }
}

module.exports = { pricingValues: pricingValues, syncPricing: syncPricing };

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
