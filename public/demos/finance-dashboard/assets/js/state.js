(function (root, factory) {
  var exports = factory();
  if (typeof module === "object" && module && module.exports) {
    module.exports = exports;
  } else {
    root.ClearLedger = root.ClearLedger || {};
    root.ClearLedger.state = exports;
  }
})(typeof window !== "undefined" ? window : this, function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pad2(value) {
    var text = String(value);
    return text.length < 2 ? "0" + text : text;
  }

  function todayIsoDate() {
    var now = new Date();
    return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
  }

  function getMonthKeyFromDate(isoDate) {
    if (!isoDate || typeof isoDate !== "string") return "";
    return isoDate.slice(0, 7);
  }

  function startOfMonth(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  }

  function endOfMonth(dateObj) {
    return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
  }

  function toIsoDate(dateObj) {
    return dateObj.getFullYear() + "-" + pad2(dateObj.getMonth() + 1) + "-" + pad2(dateObj.getDate());
  }

  function getThisMonthRange() {
    var now = new Date();
    var start = startOfMonth(now);
    var end = endOfMonth(now);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }

  function getLastMonthRange() {
    var now = new Date();
    var prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var start = startOfMonth(prev);
    var end = endOfMonth(prev);
    return { start: toIsoDate(start), end: toIsoDate(end) };
  }

  function isIsoDateInRange(isoDate, startIso, endIso) {
    if (!isoDate) return false;
    if (startIso && isoDate < startIso) return false;
    if (endIso && isoDate > endIso) return false;
    return true;
  }

  function parseMoneyToCents(input) {
    var raw = String(input == null ? "" : input).trim();
    if (!raw) return null;

    var normalized = raw.replace(/[$,\s]/g, "");
    var match = normalized.match(/^(-?)(\d+)(?:\.(\d{0,2}))?$/);
    if (!match) return null;

    var isNegative = match[1] === "-";
    var dollars = parseInt(match[2], 10);
    var centsPart = match[3] || "";
    while (centsPart.length < 2) centsPart += "0";
    var cents = parseInt(centsPart || "0", 10);

    var total = dollars * 100 + cents;
    if (!isFinite(total)) return null;
    if (isNegative) return null;
    return total;
  }

  function formatCents(currency, amountCents) {
    var cents = typeof amountCents === "number" ? amountCents : 0;
    var dollars = cents / 100;
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(dollars);
    } catch (e) {
      return "$" + dollars.toFixed(2);
    }
  }

  function sumCents(transactions) {
    var total = 0;
    for (var i = 0; i < transactions.length; i++) {
      total += transactions[i].amountCents || 0;
    }
    return total;
  }

  function getTransactionsInRange(transactions, range) {
    var start = range && range.start ? range.start : "";
    var end = range && range.end ? range.end : "";
    var filtered = [];
    for (var i = 0; i < transactions.length; i++) {
      var txn = transactions[i];
      if (!txn || !txn.date) continue;
      if (isIsoDateInRange(txn.date, start, end)) filtered.push(txn);
    }
    return filtered;
  }

  function getTotals(transactions) {
    var income = 0;
    var expenses = 0;
    for (var i = 0; i < transactions.length; i++) {
      var txn = transactions[i];
      if (!txn) continue;
      var amount = txn.amountCents || 0;
      if (txn.type === "income") income += amount;
      if (txn.type === "expense") expenses += amount;
    }
    return { incomeCents: income, expenseCents: expenses, netCents: income - expenses };
  }

  function getExpenseBreakdownByCategory(transactions, categoriesById) {
    var totals = {};
    for (var i = 0; i < transactions.length; i++) {
      var txn = transactions[i];
      if (!txn || txn.type !== "expense") continue;
      var id = txn.categoryId || "other";
      totals[id] = (totals[id] || 0) + (txn.amountCents || 0);
    }

    var items = [];
    for (var key in totals) {
      if (!Object.prototype.hasOwnProperty.call(totals, key)) continue;
      items.push({
        categoryId: key,
        label: (categoriesById && categoriesById[key] && categoriesById[key].label) || key,
        cents: totals[key]
      });
    }

    items.sort(function (a, b) {
      return b.cents - a.cents;
    });
    return items;
  }

  function groupByDaySeries(transactions, range) {
    var start = range && range.start ? range.start : "";
    var end = range && range.end ? range.end : "";
    if (!start || !end) return [];

    var series = [];
    var cursor = new Date(start + "T00:00:00");
    var endDate = new Date(end + "T00:00:00");
    if (isNaN(cursor.getTime()) || isNaN(endDate.getTime())) return [];

    var map = {};
    for (var i = 0; i < transactions.length; i++) {
      var txn = transactions[i];
      if (!txn || !txn.date) continue;
      if (!isIsoDateInRange(txn.date, start, end)) continue;
      if (!map[txn.date]) map[txn.date] = { incomeCents: 0, expenseCents: 0 };
      if (txn.type === "income") map[txn.date].incomeCents += txn.amountCents || 0;
      if (txn.type === "expense") map[txn.date].expenseCents += txn.amountCents || 0;
    }

    while (cursor.getTime() <= endDate.getTime()) {
      var key = toIsoDate(cursor);
      var day = map[key] || { incomeCents: 0, expenseCents: 0 };
      series.push({ date: key, incomeCents: day.incomeCents, expenseCents: day.expenseCents });
      cursor.setDate(cursor.getDate() + 1);
    }

    return series;
  }

  function computeBudgetProgress(budget, expensesInMonthCents) {
    var limit = budget && typeof budget.limitCents === "number" ? budget.limitCents : 0;
    var spent = typeof expensesInMonthCents === "number" ? expensesInMonthCents : 0;
    var remaining = limit - spent;
    var ratio = limit > 0 ? spent / limit : 0;
    return {
      limitCents: limit,
      spentCents: spent,
      remainingCents: remaining,
      isOverspent: limit > 0 && spent > limit,
      progressRatio: clamp(ratio, 0, 1.6)
    };
  }

  function getMonthExpenseTotalsByCategory(transactions, monthKey, categoriesById) {
    var start = monthKey + "-01";
    var cursor = new Date(start + "T00:00:00");
    if (isNaN(cursor.getTime())) return {};
    var end = endOfMonth(cursor);
    var range = { start: toIsoDate(cursor), end: toIsoDate(end) };

    var filtered = getTransactionsInRange(transactions, range);
    var totals = {};
    for (var i = 0; i < filtered.length; i++) {
      var txn = filtered[i];
      if (!txn || txn.type !== "expense") continue;
      var id = txn.categoryId || "other";
      totals[id] = (totals[id] || 0) + (txn.amountCents || 0);
    }

    if (categoriesById) {
      for (var k in categoriesById) {
        if (!Object.prototype.hasOwnProperty.call(categoriesById, k)) continue;
        if (categoriesById[k].type !== "expense") continue;
        if (!totals[k]) totals[k] = 0;
      }
    }

    return totals;
  }

  return {
    todayIsoDate: todayIsoDate,
    getThisMonthRange: getThisMonthRange,
    getLastMonthRange: getLastMonthRange,
    getMonthKeyFromDate: getMonthKeyFromDate,
    isIsoDateInRange: isIsoDateInRange,
    parseMoneyToCents: parseMoneyToCents,
    formatCents: formatCents,
    sumCents: sumCents,
    getTransactionsInRange: getTransactionsInRange,
    getTotals: getTotals,
    getExpenseBreakdownByCategory: getExpenseBreakdownByCategory,
    groupByDaySeries: groupByDaySeries,
    computeBudgetProgress: computeBudgetProgress,
    getMonthExpenseTotalsByCategory: getMonthExpenseTotalsByCategory
  };
});
