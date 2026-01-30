var test = require("node:test");
var assert = require("node:assert/strict");

var url = require("../../public/demos/launchclock/assets/js/url.js");

test("parseConfig accepts valid params and normalizes config", function () {
  var search = "?name=Demo%20Launch&ts=1760000000000&desc=Hello&tpl=bold&pal=plum&ctaLabel=RSVP&ctaUrl=https%3A%2F%2Fexample.com%2Frsvp";
  var result = url.parseConfig(search);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.config, {
    name: "Demo Launch",
    ts: 1760000000000,
    desc: "Hello",
    tpl: "bold",
    pal: "plum",
    ctaLabel: "RSVP",
    ctaUrl: "https://example.com/rsvp"
  });
});

test("parseConfig returns structured errors for missing required fields", function () {
  var result = url.parseConfig("");
  assert.equal(Array.isArray(result.errors), true);
  assert.equal(result.errors.some(function (e) { return e.field === "name"; }), true);
  assert.equal(result.errors.some(function (e) { return e.field === "ts"; }), true);
});

test("parseConfig enforces https-only CTA URLs", function () {
  var search = "?name=Demo&ts=1760000000000&ctaLabel=Learn%20more&ctaUrl=http%3A%2F%2Fexample.com";
  var result = url.parseConfig(search);
  assert.equal(result.errors.some(function (e) { return e.field === "ctaUrl"; }), true);
});

test("buildShareUrl round-trips via parseConfig", function () {
  var base = "https://localbytellc.com/demos/launchclock/countdown.html";
  var config = {
    name: "Launch Day",
    ts: 1760000000000,
    desc: "A short description.",
    tpl: "elegant",
    pal: "sunset",
    ctaLabel: "Get updates",
    ctaUrl: "https://example.com/updates"
  };

  var built = url.buildShareUrl(config, base);
  var parsed = url.parseConfig(new URL(built).search);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.config, config);
});

