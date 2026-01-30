var test = require("node:test");
var assert = require("node:assert/strict");

var time = require("../../public/demos/launchclock/assets/js/time.js");

test("parseDatetimeLocalToTs parses datetime-local values as local time", function () {
  var ts = time.parseDatetimeLocalToTs("2026-02-03T04:05");
  assert.equal(ts, new Date(2026, 1, 3, 4, 5, 0, 0).getTime());
});

test("formatTsForDatetimeLocal round-trips with parseDatetimeLocalToTs", function () {
  var original = new Date(2026, 8, 19, 12, 34, 0, 0).getTime();
  var formatted = time.formatTsForDatetimeLocal(original);
  var parsed = time.parseDatetimeLocalToTs(formatted);
  assert.equal(parsed, original);
});

test("getTimeParts uses ceil seconds and expires at zero", function () {
  var now = 1000000;
  assert.deepEqual(time.getTimeParts(now, now), {
    isExpired: true,
    totalSeconds: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  var parts = time.getTimeParts(now + 1, now);
  assert.equal(parts.isExpired, false);
  assert.equal(parts.totalSeconds, 1);
  assert.equal(parts.seconds, 1);

  var parts2 = time.getTimeParts(now + 1001, now);
  assert.equal(parts2.totalSeconds, 2);
});

