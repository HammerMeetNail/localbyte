(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  var state = window.ClearLedger.state;
  var charts = window.ClearLedger.charts;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function categoriesById(categories) {
    var map = {};
    for (var i = 0; i < categories.length; i++) {
      map[categories[i].id] = categories[i];
    }
    return map;
  }

  function getBudgetsForMonth(stateObj, monthKey) {
    var all = stateObj.budgets || [];
    var found = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].month === monthKey) found.push(all[i]);
    }
    return found;
  }

  function renderSampleBanner(stateObj) {
    var banner = qs("[data-sample-banner]");
    if (!banner) return;
    var isSample = !!(stateObj.settings && stateObj.settings.isSampleData);
    banner.hidden = !isSample;
  }

  function renderSummary(stateObj, range, cats) {
    var currency = (stateObj.settings && stateObj.settings.currency) || "USD";
    var txns = state.getTransactionsInRange(stateObj.transactions || [], range);
    var totals = state.getTotals(txns);

    var incomeEl = qs("[data-summary-income]");
    var expenseEl = qs("[data-summary-expenses]");
    var netEl = qs("[data-summary-net]");
    var topEl = qs("[data-summary-top]");
    if (incomeEl) incomeEl.textContent = state.formatCents(currency, totals.incomeCents);
    if (expenseEl) expenseEl.textContent = state.formatCents(currency, totals.expenseCents);
    if (netEl) netEl.textContent = state.formatCents(currency, totals.netCents);

    var breakdown = state.getExpenseBreakdownByCategory(txns, cats);
    if (topEl) {
      if (!breakdown.length) topEl.textContent = "—";
      else topEl.textContent = breakdown[0].label;
    }
  }

  function renderBudgetsSnapshot(stateObj, monthKey, cats) {
    var currency = (stateObj.settings && stateObj.settings.currency) || "USD";
    var wrap = qs("[data-budgets-snapshot]");
    if (!wrap) return;

    var budgets = getBudgetsForMonth(stateObj, monthKey);
    if (!budgets.length) {
      wrap.innerHTML = ""
        + "<p class=\"muted\">No budgets set yet for " + charts.escapeHtml(monthKey) + ".</p>"
        + "<p class=\"small\"><a class=\"button secondary\" href=\"budgets.html\">Set budgets</a></p>";
      return;
    }

    var totalsByCat = state.getMonthExpenseTotalsByCategory(stateObj.transactions || [], monthKey, cats);
    var overallExpense = 0;
    for (var k in totalsByCat) {
      if (Object.prototype.hasOwnProperty.call(totalsByCat, k)) overallExpense += totalsByCat[k] || 0;
    }

    budgets.sort(function (a, b) {
      if (a.categoryId === "all") return -1;
      if (b.categoryId === "all") return 1;
      return (cats[a.categoryId] ? cats[a.categoryId].label : a.categoryId).localeCompare(cats[b.categoryId] ? cats[b.categoryId].label : b.categoryId);
    });

    var rows = "";
    for (var i = 0; i < budgets.length; i++) {
      if (i > 3) break;
      var budget = budgets[i];
      var label = budget.categoryId === "all" ? "Overall" : (cats[budget.categoryId] ? cats[budget.categoryId].label : budget.categoryId);
      var spent = budget.categoryId === "all" ? overallExpense : (totalsByCat[budget.categoryId] || 0);
      var progress = state.computeBudgetProgress(budget, spent);
      var pct = progress.limitCents > 0 ? Math.round(Math.min(1, progress.spentCents / progress.limitCents) * 100) : 0;

      rows += ""
        + "<div class=\"progress-row\">"
        + "<div class=\"progress-top\">"
        + "<strong>" + charts.escapeHtml(label) + "</strong>"
        + "<span class=\"small muted\">" + charts.escapeHtml(state.formatCents(currency, progress.spentCents)) + " of " + charts.escapeHtml(state.formatCents(currency, progress.limitCents)) + "</span>"
        + "</div>"
        + "<div class=\"progress-bar\" aria-label=\"" + charts.escapeHtml(label) + " budget progress\">"
        + "<div class=\"progress-fill" + (progress.isOverspent ? " overspent" : "") + "\" style=\"width: " + pct + "%\"></div>"
        + "</div>"
        + "</div>";
    }

    wrap.innerHTML = ""
      + "<div class=\"progress-list\">" + rows + "</div>"
      + "<p class=\"small muted budget-note\">Budgets track expense spending only.</p>";
  }

  function renderCharts(stateObj, range, cats) {
    var currency = (stateObj.settings && stateObj.settings.currency) || "USD";
    var formatter = function (cents) {
      return state.formatCents(currency, cents);
    };

    var txns = state.getTransactionsInRange(stateObj.transactions || [], range);

    var breakdown = state.getExpenseBreakdownByCategory(txns, cats);
    var categoryChart = qs("[data-category-chart]");
    if (categoryChart) charts.renderBarChart(categoryChart, breakdown, formatter);

    var categorySummary = qs("[data-category-summary]");
    if (categorySummary) {
      if (!breakdown.length) categorySummary.textContent = "No expense data in range.";
      else categorySummary.textContent = "Top category: " + breakdown[0].label + " (" + formatter(breakdown[0].cents) + ")";
    }

    var categoryTableWrap = qs("[data-category-table] .details-body");
    if (categoryTableWrap) {
      if (!breakdown.length) categoryTableWrap.innerHTML = "<p class=\"muted\">No category data.</p>";
      else {
        var rows = [];
        for (var i = 0; i < breakdown.length; i++) {
          rows.push([charts.escapeHtml(breakdown[i].label), charts.escapeHtml(formatter(breakdown[i].cents))]);
        }
        categoryTableWrap.innerHTML = charts.tableHtml(["Category", "Amount"], rows);
      }
    }

    var series = state.groupByDaySeries(stateObj.transactions || [], range);
    var trendChart = qs("[data-trend-chart]");
    if (trendChart) charts.renderLineChart(trendChart, series, formatter);

    var trendSummary = qs("[data-trend-summary]");
    if (trendSummary) {
      if (!series.length) trendSummary.textContent = "No data in range.";
      else {
        var totals = state.getTotals(txns);
        trendSummary.textContent = "Net: " + formatter(totals.netCents) + " • Income: " + formatter(totals.incomeCents) + " • Expenses: " + formatter(totals.expenseCents);
      }
    }

    var trendTableWrap = qs("[data-trend-table] .details-body");
    if (trendTableWrap) {
      if (!series.length) trendTableWrap.innerHTML = "<p class=\"muted\">No trend data.</p>";
      else {
        var seriesRows = [];
        for (var j = 0; j < series.length; j++) {
          seriesRows.push([
            charts.escapeHtml(series[j].date),
            charts.escapeHtml(formatter(series[j].incomeCents)),
            charts.escapeHtml(formatter(series[j].expenseCents))
          ]);
        }
        trendTableWrap.innerHTML = charts.tableHtml(["Date", "Income", "Expenses"], seriesRows);
      }
    }
  }

  function renderRecent(stateObj, range, cats) {
    var currency = (stateObj.settings && stateObj.settings.currency) || "USD";
    var wrap = qs("[data-recent-transactions]");
    if (!wrap) return;

    var txns = state.getTransactionsInRange(stateObj.transactions || [], range);
    if (!txns.length) {
      wrap.innerHTML = "<p class=\"muted\">No transactions in range yet. <a href=\"transactions.html#add\">Add one</a>.</p>";
      return;
    }

    txns.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    var html = "<ul class=\"recent-list\">";
    for (var i = 0; i < txns.length && i < 6; i++) {
      var txn = txns[i];
      var cat = cats[txn.categoryId];
      var label = cat ? cat.label : txn.categoryId;
      var amount = state.formatCents(currency, txn.amountCents || 0);
      html += ""
        + "<li class=\"recent-item\">"
        + "<span class=\"small muted\">" + charts.escapeHtml(txn.date || "") + "</span>"
        + "<span><strong>" + charts.escapeHtml(label || "") + "</strong> <span class=\"muted\">(" + charts.escapeHtml(txn.type) + ")</span></span>"
        + "<span class=\"small recent-amount\">" + charts.escapeHtml(amount) + "</span>"
        + "</li>";
    }
    html += "</ul>";
    wrap.innerHTML = html;
  }

  function initDashboard(stateObj) {
    if (!stateObj || !state) return;
    var cats = categoriesById(stateObj.categories || []);

    renderSampleBanner(stateObj);

    var range = state.getThisMonthRange();
    renderSummary(stateObj, range, cats);
    renderBudgetsSnapshot(stateObj, range.start.slice(0, 7), cats);
    renderCharts(stateObj, range, cats);
    renderRecent(stateObj, range, cats);
  }

  window.ClearLedger.dashboard = { init: initDashboard };
})();
