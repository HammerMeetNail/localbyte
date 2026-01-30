(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  var state = window.ClearLedger.state;
  var charts = window.ClearLedger.charts;
  var storage = window.ClearLedger.storage;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

  function categoriesById(categories) {
    var map = {};
    for (var i = 0; i < categories.length; i++) {
      map[categories[i].id] = categories[i];
    }
    return map;
  }

  function createId() {
    return "txn-" + Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  }

  function normalizeNewTransaction(formData, currency) {
    var errors = {};
    var date = String(formData.date || "").trim();
    var type = String(formData.type || "").trim();
    var categoryId = String(formData.categoryId || "").trim();
    var note = String(formData.note || "").trim();
    var amountCents = state.parseMoneyToCents(formData.amount);

    if (!date) errors.date = "Choose a date.";
    if (!type || (type !== "expense" && type !== "income")) errors.type = "Choose a type.";
    if (!categoryId) errors.categoryId = "Choose a category.";
    if (amountCents == null) errors.amount = "Enter a valid amount (for example 9.50).";
    if (amountCents != null && amountCents <= 0) errors.amount = "Enter an amount greater than 0.";

    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var now = new Date().toISOString();
    return {
      ok: true,
      txn: {
        id: createId(),
        date: date,
        type: type,
        categoryId: categoryId,
        amountCents: amountCents,
        note: note,
        createdAt: now,
        updatedAt: now
      }
    };
  }

  function renderCategoryOptions(selectEl, categories, type) {
    if (!selectEl) return;
    var options = "";
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];
      if (cat.type !== type) continue;
      options += "<option value=\"" + charts.escapeHtml(cat.id) + "\">" + charts.escapeHtml(cat.label) + "</option>";
    }
    selectEl.innerHTML = options;
  }

  function setFieldError(fieldId, message) {
    var field = qs("#" + fieldId);
    if (!field) return;
    var wrapper = field.closest(".field");
    var errorEl = qs("#" + fieldId + "-error");
    var hintEl = qs("#" + fieldId + "-hint");
    if (wrapper) wrapper.classList.toggle("has-error", !!message);
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.hidden = !message;
    }
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl && hintEl) field.setAttribute("aria-describedby", hintEl.id + " " + errorEl.id);
      else if (errorEl) field.setAttribute("aria-describedby", errorEl.id);
    } else {
      field.removeAttribute("aria-invalid");
      if (hintEl) field.setAttribute("aria-describedby", hintEl.id);
      else field.removeAttribute("aria-describedby");
    }
  }

  function renderErrorSummary(container, errors) {
    if (!container) return;
    var keys = Object.keys(errors || {});
    if (!keys.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }

    var html = "<p><strong>Please fix the following:</strong></p><ul>";
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var targetId = "txn-" + key;
      if (key === "categoryId") targetId = "txn-category";
      if (key === "amount") targetId = "txn-amount";
      if (key === "date") targetId = "txn-date";
      if (key === "type") targetId = "txn-type";
      html += "<li><a href=\"#" + charts.escapeHtml(targetId) + "\">" + charts.escapeHtml(errors[key]) + "</a></li>";
    }
    html += "</ul>";
    container.innerHTML = html;
    container.hidden = false;
    container.focus && container.focus();
  }

  function currentRangeFromUi() {
    var active = qs("[data-range][aria-pressed=\"true\"]");
    var mode = active ? active.getAttribute("data-range") : "this-month";
    if (mode === "last-month") return state.getLastMonthRange();
    if (mode === "custom") {
      var start = (qs("#range-start") && qs("#range-start").value) || "";
      var end = (qs("#range-end") && qs("#range-end").value) || "";
      return { start: start, end: end };
    }
    return state.getThisMonthRange();
  }

  function renderTransactions(stateObj, range) {
    var currency = (stateObj.settings && stateObj.settings.currency) || "USD";
    var cats = categoriesById(stateObj.categories || []);
    var filtered = state.getTransactionsInRange(stateObj.transactions || [], range);

    var countEl = qs("[data-transactions-count]");
    if (countEl) {
      countEl.textContent = filtered.length + " transaction" + (filtered.length === 1 ? "" : "s") + " in range";
    }

    var tbody = qs("[data-transactions-tbody]");
    var cards = qs("[data-transactions-cards]");
    var emptyEl = qs("[data-transactions-empty]");

    if (emptyEl) emptyEl.hidden = filtered.length !== 0;

    if (tbody) tbody.innerHTML = "";
    if (cards) cards.innerHTML = "";

    if (!filtered.length) return;

    filtered.sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });

    for (var i = 0; i < filtered.length; i++) {
      var txn = filtered[i];
      var cat = cats[txn.categoryId];
      var label = cat ? cat.label : txn.categoryId;
      var amount = state.formatCents(currency, txn.amountCents || 0);
      var typeLabel = txn.type === "income" ? "Income" : "Expense";

      if (tbody) {
        var tr = document.createElement("tr");
        tr.innerHTML = ""
          + "<td>" + charts.escapeHtml(txn.date || "") + "</td>"
          + "<td><span class=\"pill " + charts.escapeHtml(txn.type || "") + "\">" + charts.escapeHtml(typeLabel) + "</span></td>"
          + "<td>" + charts.escapeHtml(label || "") + "</td>"
          + "<td><strong>" + charts.escapeHtml(amount) + "</strong></td>"
          + "<td>" + charts.escapeHtml(txn.note || "") + "</td>"
          + "<td><button class=\"icon-button\" type=\"button\" data-delete=\"" + charts.escapeHtml(txn.id) + "\">Delete</button></td>";
        tbody.appendChild(tr);
      }

      if (cards) {
        var li = document.createElement("li");
        li.className = "txn-card";
        li.innerHTML = ""
          + "<div class=\"txn-card-head\">"
          + "<strong>" + charts.escapeHtml(label || "") + "</strong>"
          + "<span class=\"pill " + charts.escapeHtml(txn.type || "") + "\">" + charts.escapeHtml(typeLabel) + "</span>"
          + "</div>"
          + "<div class=\"txn-card-meta small muted\">" + charts.escapeHtml(txn.date || "") + " • " + charts.escapeHtml(amount) + "</div>"
          + (txn.note ? "<div class=\"small\">" + charts.escapeHtml(txn.note) + "</div>" : "")
          + "<div class=\"txn-actions\"><button class=\"icon-button\" type=\"button\" data-delete=\"" + charts.escapeHtml(txn.id) + "\">Delete</button></div>";
        cards.appendChild(li);
      }
    }
  }

  function removeTransactionById(stateObj, id) {
    var next = JSON.parse(JSON.stringify(stateObj));
    var txns = next.transactions || [];
    var removed = null;
    next.transactions = [];
    for (var i = 0; i < txns.length; i++) {
      if (txns[i].id === id) removed = txns[i];
      else next.transactions.push(txns[i]);
    }
    return { next: next, removed: removed };
  }

  function addTransaction(stateObj, txn) {
    var next = JSON.parse(JSON.stringify(stateObj));
    next.transactions = next.transactions || [];
    next.transactions.push(txn);
    return next;
  }

  function initTransactionsPage(initialState) {
    if (!initialState) return;
    var currency = (initialState.settings && initialState.settings.currency) || "USD";
    var localState = initialState;

    var form = qs("[data-transaction-form]");
    var errorsEl = qs("[data-form-errors]");
    var typeEl = qs("#txn-type");
    var catEl = qs("#txn-category");
    var dateEl = qs("#txn-date");

    if (dateEl && !dateEl.value) dateEl.value = state.todayIsoDate();

    function catsFor(type) {
      var all = localState.categories || [];
      var filtered = [];
      for (var i = 0; i < all.length; i++) {
        if (all[i].type === type) filtered.push(all[i]);
      }
      return filtered;
    }

    function syncCategories() {
      var type = (typeEl && typeEl.value) || "expense";
      var selected = catEl ? catEl.value : "";
      renderCategoryOptions(catEl, catsFor(type), type);
      if (selected) catEl.value = selected;
      if (!catEl.value && catEl.options.length) catEl.value = catEl.options[0].value;
    }

    if (typeEl) {
      typeEl.addEventListener("change", function () {
        syncCategories();
      });
    }

    syncCategories();

    function clearErrors() {
      if (errorsEl) {
        errorsEl.hidden = true;
        errorsEl.innerHTML = "";
      }
      setFieldError("txn-date", "");
      setFieldError("txn-type", "");
      setFieldError("txn-amount", "");
      setFieldError("txn-category", "");
    }

    function persist(nextState) {
      var saved = storage.save(nextState);
      localState = saved.state;
      if (!saved.ok && window.ClearLedger.toast) window.ClearLedger.toast("Storage unavailable — changes won’t persist.");
      return localState;
    }

    function rerender() {
      renderTransactions(localState, currentRangeFromUi());
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearErrors();

        var data = {
          date: form.date.value,
          type: form.type.value,
          amount: form.amount.value,
          categoryId: form.categoryId.value,
          note: form.note.value
        };

        var next = normalizeNewTransaction(data, currency);
        if (!next.ok) {
          if (next.errors.date) setFieldError("txn-date", next.errors.date);
          if (next.errors.type) setFieldError("txn-type", next.errors.type);
          if (next.errors.amount) setFieldError("txn-amount", next.errors.amount);
          if (next.errors.categoryId) setFieldError("txn-category", next.errors.categoryId);
          renderErrorSummary(errorsEl, next.errors);
          return;
        }

        localState = persist(addTransaction(localState, next.txn));
        form.reset();
        if (dateEl) dateEl.value = state.todayIsoDate();
        syncCategories();
        rerender();
        if (window.ClearLedger.toast) window.ClearLedger.toast("Transaction saved.");
      });

      form.addEventListener("reset", function () {
        window.setTimeout(function () {
          clearErrors();
          if (dateEl) dateEl.value = state.todayIsoDate();
          syncCategories();
        }, 0);
      });
    }

    var filters = qs("[data-filters]");
    if (filters) {
      filters.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-range]");
        if (!btn) return;
        var range = btn.getAttribute("data-range");
        var all = qsa("[data-range]");
        for (var i = 0; i < all.length; i++) {
          all[i].setAttribute("aria-pressed", all[i] === btn ? "true" : "false");
        }
        var custom = qs("[data-custom-range]");
        if (custom) custom.hidden = range !== "custom";
        rerender();
      });

      filters.addEventListener("change", function (event) {
        if (event.target && (event.target.id === "range-start" || event.target.id === "range-end")) {
          rerender();
        }
      });
    }

    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-delete]");
      if (!btn) return;
      var id = btn.getAttribute("data-delete");
      var removedResult = removeTransactionById(localState, id);
      if (!removedResult.removed) return;

      localState = persist(removedResult.next);
      rerender();

      var removedTxn = removedResult.removed;
      if (window.ClearLedger.toast) {
        window.ClearLedger.toast("Transaction deleted.", [
          {
            label: "Undo",
            onClick: function () {
              localState = persist(addTransaction(localState, removedTxn));
              rerender();
            }
          }
        ]);
      }
    }, false);

    rerender();
  }

  window.ClearLedger.transactionsPage = { init: initTransactionsPage };
})();
