(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  var state = window.ClearLedger.state;
  var charts = window.ClearLedger.charts;
  var storage = window.ClearLedger.storage;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function createId(prefix) {
    return prefix + "-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function categoriesById(categories) {
    var map = {};
    for (var i = 0; i < categories.length; i++) map[categories[i].id] = categories[i];
    return map;
  }

  function getExpenseCategories(categories) {
    var out = [];
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].type === "expense") out.push(categories[i]);
    }
    return out;
  }

  function getBudgetsForMonth(stateObj, monthKey) {
    var all = stateObj.budgets || [];
    var found = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].month === monthKey) found.push(all[i]);
    }
    return found;
  }

  function upsertBudget(stateObj, monthKey, categoryId, limitCents) {
    var next = JSON.parse(JSON.stringify(stateObj));
    var budgets = next.budgets || [];
    var foundIndex = -1;
    for (var i = 0; i < budgets.length; i++) {
      if (budgets[i].month === monthKey && budgets[i].categoryId === categoryId) {
        foundIndex = i;
        break;
      }
    }

    if (!limitCents) {
      if (foundIndex !== -1) budgets.splice(foundIndex, 1);
      next.budgets = budgets;
      return next;
    }

    var now = new Date().toISOString();
    if (foundIndex !== -1) {
      budgets[foundIndex].limitCents = limitCents;
      budgets[foundIndex].updatedAt = now;
    } else {
      budgets.push({ id: createId("bud"), month: monthKey, categoryId: categoryId, limitCents: limitCents, createdAt: now, updatedAt: now });
    }
    next.budgets = budgets;
    return next;
  }

  function clearBudgetsForMonth(stateObj, monthKey) {
    var next = JSON.parse(JSON.stringify(stateObj));
    var budgets = next.budgets || [];
    var kept = [];
    for (var i = 0; i < budgets.length; i++) {
      if (budgets[i].month !== monthKey) kept.push(budgets[i]);
    }
    next.budgets = kept;
    return next;
  }

  function initBudgetsPage(initialState) {
    if (!initialState) return;
    var currency = (initialState.settings && initialState.settings.currency) || "USD";
    var localState = initialState;
    var cats = categoriesById(localState.categories || []);
    var expenseCats = getExpenseCategories(localState.categories || []);

    var monthInput = qs("#budget-month");
    var fieldsWrap = qs("[data-budget-category-fields]");
    var overallInput = qs("#budget-overall");
    var form = qs("[data-budget-form]");
    var errorsEl = qs("[data-budget-errors]");
    var progressEl = qs("[data-budget-progress]");
    var progressCaption = qs("[data-budget-progress-caption]");
    var clearBtn = qs("[data-clear-budgets]");

    function defaultMonth() {
      var now = new Date();
      var rawMonth = String(now.getMonth() + 1);
      var mm = rawMonth.length < 2 ? "0" + rawMonth : rawMonth;
      return now.getFullYear() + "-" + mm;
    }

    function showError(message) {
      if (!errorsEl) return;
      errorsEl.hidden = !message;
      errorsEl.innerHTML = message ? "<p><strong>" + charts.escapeHtml(message) + "</strong></p>" : "";
      if (message && errorsEl.focus) errorsEl.focus();
    }

    function persist(nextState) {
      var saved = storage.save(nextState);
      localState = saved.state;
      if (!saved.ok && window.ClearLedger.toast) window.ClearLedger.toast("Storage unavailable — changes won’t persist.");
      return localState;
    }

    function renderCategoryFields(monthKey) {
      if (!fieldsWrap) return;
      var budgets = getBudgetsForMonth(localState, monthKey);
      var byCat = {};
      for (var i = 0; i < budgets.length; i++) {
        byCat[budgets[i].categoryId] = budgets[i];
      }

      var html = "";
      for (var j = 0; j < expenseCats.length; j++) {
        var cat = expenseCats[j];
        var budget = byCat[cat.id];
        var value = budget ? String((budget.limitCents || 0) / 100) : "";
        html += ""
          + "<div class=\"field\">"
          + "<label for=\"budget-" + charts.escapeHtml(cat.id) + "\">" + charts.escapeHtml(cat.label) + "</label>"
          + "<input id=\"budget-" + charts.escapeHtml(cat.id) + "\" name=\"cat-" + charts.escapeHtml(cat.id) + "\" inputmode=\"decimal\" placeholder=\"0\" value=\"" + charts.escapeHtml(value) + "\" />"
          + "</div>";
      }
      fieldsWrap.innerHTML = html;
    }

    function renderOverallField(monthKey) {
      if (!overallInput) return;
      var budgets = getBudgetsForMonth(localState, monthKey);
      var overall = null;
      for (var i = 0; i < budgets.length; i++) {
        if (budgets[i].categoryId === "all") overall = budgets[i];
      }
      overallInput.value = overall ? String((overall.limitCents || 0) / 100) : "";
    }

    function renderProgress(monthKey) {
      if (!progressEl) return;
      var budgets = getBudgetsForMonth(localState, monthKey);
      if (!budgets.length) {
        progressEl.innerHTML = "<p class=\"muted\">No budgets set for this month yet.</p>";
        if (progressCaption) progressCaption.textContent = "Set a budget to see progress.";
        return;
      }

      var expenseTotalsByCat = state.getMonthExpenseTotalsByCategory(localState.transactions || [], monthKey, cats);
      var overallExpense = 0;
      for (var k in expenseTotalsByCat) {
        if (Object.prototype.hasOwnProperty.call(expenseTotalsByCat, k)) overallExpense += expenseTotalsByCat[k] || 0;
      }

      budgets.sort(function (a, b) {
        if (a.categoryId === "all") return -1;
        if (b.categoryId === "all") return 1;
        return (cats[a.categoryId] ? cats[a.categoryId].label : a.categoryId).localeCompare(cats[b.categoryId] ? cats[b.categoryId].label : b.categoryId);
      });

      var rows = "";
      for (var i = 0; i < budgets.length; i++) {
        var budget = budgets[i];
        var label = budget.categoryId === "all" ? "Overall" : (cats[budget.categoryId] ? cats[budget.categoryId].label : budget.categoryId);
        var spent = budget.categoryId === "all" ? overallExpense : (expenseTotalsByCat[budget.categoryId] || 0);
        var progress = state.computeBudgetProgress(budget, spent);
        var ratio = progress.limitCents > 0 ? Math.min(1.6, progress.spentCents / progress.limitCents) : 0;
        var pct = Math.round(Math.min(1, ratio) * 100);

        rows += ""
          + "<div class=\"progress-row\">"
          + "<div class=\"progress-top\">"
          + "<strong>" + charts.escapeHtml(label) + "</strong>"
          + "<span class=\"small muted\">" + charts.escapeHtml(state.formatCents(currency, progress.spentCents)) + " of " + charts.escapeHtml(state.formatCents(currency, progress.limitCents)) + "</span>"
          + "</div>"
          + "<div class=\"progress-bar\" aria-label=\"" + charts.escapeHtml(label) + " budget progress\">"
          + "<div class=\"progress-fill" + (progress.isOverspent ? " overspent" : "") + "\" style=\"width: " + pct + "%\"></div>"
          + "</div>"
          + "<div class=\"small muted\">" + (progress.isOverspent ? "Overspent by " + charts.escapeHtml(state.formatCents(currency, Math.abs(progress.remainingCents))) : "Remaining " + charts.escapeHtml(state.formatCents(currency, progress.remainingCents))) + "</div>"
          + "</div>";
      }

      progressEl.innerHTML = "<div class=\"progress-list\">" + rows + "</div>";
      if (progressCaption) progressCaption.textContent = "Progress is based on expenses in " + monthKey + ".";
    }

    function rerender() {
      var monthKey = (monthInput && monthInput.value) || defaultMonth();
      if (monthInput && !monthInput.value) monthInput.value = monthKey;
      renderOverallField(monthKey);
      renderCategoryFields(monthKey);
      renderProgress(monthKey);
    }

    function parseBudgetInput(value) {
      if (!String(value || "").trim()) return 0;
      var cents = state.parseMoneyToCents(value);
      if (cents == null) return null;
      return cents;
    }

    if (monthInput) {
      monthInput.value = defaultMonth();
      monthInput.addEventListener("change", function () {
        rerender();
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        showError("");

        var monthKey = (monthInput && monthInput.value) || defaultMonth();
        var nextState = localState;

        var overall = parseBudgetInput(overallInput ? overallInput.value : "");
        if (overall == null) {
          showError("Overall budget must be a valid, positive amount.");
          return;
        }
        nextState = upsertBudget(nextState, monthKey, "all", overall);

        for (var i = 0; i < expenseCats.length; i++) {
          var cat = expenseCats[i];
          var input = qs("#budget-" + cat.id);
          if (!input) continue;
          var cents = parseBudgetInput(input.value);
          if (cents == null) {
            showError(cat.label + " budget must be a valid, positive amount.");
            return;
          }
          nextState = upsertBudget(nextState, monthKey, cat.id, cents);
        }

        localState = persist(nextState);
        rerender();
        if (window.ClearLedger.toast) window.ClearLedger.toast("Budgets saved.");
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var monthKey = (monthInput && monthInput.value) || defaultMonth();
        if (!window.confirm("Clear all budgets for " + monthKey + "?")) return;
        localState = persist(clearBudgetsForMonth(localState, monthKey));
        rerender();
        if (window.ClearLedger.toast) window.ClearLedger.toast("Budgets cleared for month.");
      });
    }

    rerender();
  }

  window.ClearLedger.budgetsPage = { init: initBudgetsPage };
})();
