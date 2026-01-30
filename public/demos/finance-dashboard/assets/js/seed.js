(function (root, factory) {
  var exports = factory();
  if (typeof module === "object" && module && module.exports) {
    module.exports = exports;
  } else {
    root.ClearLedger = root.ClearLedger || {};
    root.ClearLedger.seed = exports;
  }
})(typeof window !== "undefined" ? window : this, function () {
  function pad2(value) {
    var text = String(value);
    return text.length < 2 ? "0" + text : text;
  }

  function toIsoDate(dateObj) {
    return dateObj.getFullYear() + "-" + pad2(dateObj.getMonth() + 1) + "-" + pad2(dateObj.getDate());
  }

  function monthKey(dateObj) {
    return dateObj.getFullYear() + "-" + pad2(dateObj.getMonth() + 1);
  }

  function makeId(prefix) {
    return prefix + "-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function getStaticCategories() {
    return [
      { id: "groceries", label: "Groceries", type: "expense" },
      { id: "dining", label: "Dining", type: "expense" },
      { id: "rent", label: "Rent", type: "expense" },
      { id: "utilities", label: "Utilities", type: "expense" },
      { id: "transport", label: "Transport", type: "expense" },
      { id: "health", label: "Health", type: "expense" },
      { id: "shopping", label: "Shopping", type: "expense" },
      { id: "entertainment", label: "Entertainment", type: "expense" },
      { id: "subscriptions", label: "Subscriptions", type: "expense" },
      { id: "other", label: "Other", type: "expense" },
      { id: "salary", label: "Salary", type: "income" },
      { id: "freelance", label: "Freelance", type: "income" },
      { id: "refund", label: "Refund", type: "income" },
      { id: "other-income", label: "Other income", type: "income" }
    ];
  }

  function getSeedState(now) {
    var createdAt = new Date().toISOString();
    var ref = now instanceof Date ? now : new Date();
    var baseMonth = monthKey(ref);
    var year = ref.getFullYear();
    var monthIndex = ref.getMonth();

    function d(day) {
      return toIsoDate(new Date(year, monthIndex, day));
    }

    var transactions = [
      { id: makeId("txn"), date: d(1), type: "income", categoryId: "salary", amountCents: 320000, note: "Paycheck" },
      { id: makeId("txn"), date: d(2), type: "expense", categoryId: "rent", amountCents: 145000, note: "Rent" },
      { id: makeId("txn"), date: d(3), type: "expense", categoryId: "groceries", amountCents: 6845, note: "Weekly groceries" },
      { id: makeId("txn"), date: d(4), type: "expense", categoryId: "subscriptions", amountCents: 1599, note: "Music subscription" },
      { id: makeId("txn"), date: d(6), type: "expense", categoryId: "transport", amountCents: 2600, note: "Transit pass" },
      { id: makeId("txn"), date: d(7), type: "expense", categoryId: "dining", amountCents: 2840, note: "Lunch" },
      { id: makeId("txn"), date: d(9), type: "expense", categoryId: "utilities", amountCents: 8900, note: "Electric bill" },
      { id: makeId("txn"), date: d(10), type: "income", categoryId: "freelance", amountCents: 55000, note: "Freelance invoice" },
      { id: makeId("txn"), date: d(12), type: "expense", categoryId: "shopping", amountCents: 4599, note: "Home supplies" },
      { id: makeId("txn"), date: d(13), type: "expense", categoryId: "groceries", amountCents: 9220, note: "Groceries" },
      { id: makeId("txn"), date: d(15), type: "expense", categoryId: "entertainment", amountCents: 2400, note: "Movie night" },
      { id: makeId("txn"), date: d(18), type: "expense", categoryId: "dining", amountCents: 4860, note: "Dinner with friends" },
      { id: makeId("txn"), date: d(20), type: "income", categoryId: "refund", amountCents: 3200, note: "Refund" },
      { id: makeId("txn"), date: d(22), type: "expense", categoryId: "health", amountCents: 3500, note: "Pharmacy" },
      { id: makeId("txn"), date: d(24), type: "expense", categoryId: "groceries", amountCents: 7340, note: "Groceries" },
      { id: makeId("txn"), date: d(26), type: "expense", categoryId: "transport", amountCents: 1800, note: "Rideshare" }
    ];

    var budgets = [
      { id: makeId("bud"), month: baseMonth, categoryId: "all", limitCents: 95000 },
      { id: makeId("bud"), month: baseMonth, categoryId: "groceries", limitCents: 25000 },
      { id: makeId("bud"), month: baseMonth, categoryId: "dining", limitCents: 14000 },
      { id: makeId("bud"), month: baseMonth, categoryId: "shopping", limitCents: 12000 }
    ];

    for (var i = 0; i < transactions.length; i++) {
      transactions[i].createdAt = createdAt;
      transactions[i].updatedAt = createdAt;
    }
    for (var j = 0; j < budgets.length; j++) {
      budgets[j].createdAt = createdAt;
      budgets[j].updatedAt = createdAt;
    }

    return {
      meta: { schemaVersion: 1, createdAt: createdAt, updatedAt: createdAt },
      settings: {
        currency: "USD",
        weekStartsOn: 0,
        theme: null,
        seededOnce: true,
        isSampleData: true
      },
      categories: getStaticCategories(),
      transactions: transactions,
      budgets: budgets
    };
  }

  function getEmptyState() {
    var createdAt = new Date().toISOString();
    return {
      meta: { schemaVersion: 1, createdAt: createdAt, updatedAt: createdAt },
      settings: {
        currency: "USD",
        weekStartsOn: 0,
        theme: null,
        seededOnce: true,
        isSampleData: false
      },
      categories: getStaticCategories(),
      transactions: [],
      budgets: []
    };
  }

  return { getSeedState: getSeedState, getEmptyState: getEmptyState, getStaticCategories: getStaticCategories };
});
