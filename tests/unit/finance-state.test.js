var test = require("node:test");
var assert = require("node:assert/strict");

var state = require("../../public/demos/finance-dashboard/assets/js/state.js");

test("parseMoneyToCents parses common inputs", function () {
  assert.equal(state.parseMoneyToCents("12"), 1200);
  assert.equal(state.parseMoneyToCents("12.3"), 1230);
  assert.equal(state.parseMoneyToCents("12.30"), 1230);
  assert.equal(state.parseMoneyToCents("$1,234.56"), 123456);
});

test("parseMoneyToCents rejects invalid or negative inputs", function () {
  assert.equal(state.parseMoneyToCents(""), null);
  assert.equal(state.parseMoneyToCents("abc"), null);
  assert.equal(state.parseMoneyToCents("-12.00"), null);
  assert.equal(state.parseMoneyToCents("12.345"), null);
});

test("getTotals calculates income, expenses, and net", function () {
  var txns = [
    { type: "income", amountCents: 50000 },
    { type: "expense", amountCents: 1250 },
    { type: "expense", amountCents: 8750 }
  ];
  var totals = state.getTotals(txns);
  assert.deepEqual(totals, { incomeCents: 50000, expenseCents: 10000, netCents: 40000 });
});

test("isIsoDateInRange uses inclusive boundaries", function () {
  assert.equal(state.isIsoDateInRange("2026-01-01", "2026-01-01", "2026-01-31"), true);
  assert.equal(state.isIsoDateInRange("2026-01-31", "2026-01-01", "2026-01-31"), true);
  assert.equal(state.isIsoDateInRange("2026-02-01", "2026-01-01", "2026-01-31"), false);
});

