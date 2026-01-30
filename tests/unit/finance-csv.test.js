var test = require("node:test");
var assert = require("node:assert/strict");

var csv = require("../../public/demos/finance-dashboard/assets/js/csv.js");

test("transactionsToCsv escapes commas, quotes, and newlines", function () {
  var categoriesById = { groceries: { label: "Groceries" } };
  var txns = [
    {
      date: "2026-01-02",
      type: "expense",
      categoryId: "groceries",
      amountCents: 1234,
      note: "Comma, quote \" and newline\nok"
    }
  ];

  var out = csv.transactionsToCsv(txns, categoriesById, function (cents) {
    return String(cents);
  });

  assert.match(out, /^date,type,category,amount,note\n/);
  assert.match(out, /"Comma, quote "" and newline\nok"\n$/);
});

