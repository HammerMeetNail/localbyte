(function () {
  if (!window.ClearLedger) window.ClearLedger = {};

  var state = window.ClearLedger.state;
  var csv = window.ClearLedger.csv;
  var storage = window.ClearLedger.storage;

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

  function downloadText(filename, mime, content) {
    if (!content) return;
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function isoToday() {
    var now = new Date();
    var rawMonth = String(now.getMonth() + 1);
    var rawDay = String(now.getDate());
    var mm = rawMonth.length < 2 ? "0" + rawMonth : rawMonth;
    var dd = rawDay.length < 2 ? "0" + rawDay : rawDay;
    return now.getFullYear() + "-" + mm + "-" + dd;
  }

  function initSettingsPage(initialState) {
    if (!initialState) return;
    var localState = initialState;
    var currency = (localState.settings && localState.settings.currency) || "USD";
    var cats = categoriesById(localState.categories || []);

    var statusEl = qs("[data-sample-status]");
    if (statusEl) {
      var isSample = !!(localState.settings && localState.settings.isSampleData);
      statusEl.textContent = isSample ? "Sample data is currently loaded." : "You’re in a fresh dataset (no sample data).";
    }

    var exportBtn = qs("[data-export-csv]");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var txns = (localState.transactions || []).slice();
        txns.sort(function (a, b) {
          return (a.date || "").localeCompare(b.date || "");
        });

        var formatter = function (amountCents) {
          return state.formatCents(currency, amountCents);
        };

        var content = csv.transactionsToCsv(txns, cats, formatter);
        var filename = "clearledger-transactions-" + isoToday() + ".csv";
        downloadText(filename, "text/csv;charset=utf-8", content);
        if (window.ClearLedger.toast) window.ClearLedger.toast("CSV exported.");
      });
    }

    var loadBtn = qs("[data-load-sample]");
    if (loadBtn) {
      loadBtn.addEventListener("click", function () {
        if (!window.confirm("Load sample data? This will replace your current demo data.")) return;
        var saved = storage.loadSample();
        localState = saved.state;
        if (window.ClearLedger.toast) window.ClearLedger.toast("Sample data loaded.");
        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 350);
      });
    }

    var resetBtn = qs("[data-reset-empty]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!window.confirm("Start fresh? This will clear transactions and budgets for this demo.")) return;
        var saved = storage.resetToEmpty();
        localState = saved.state;
        if (window.ClearLedger.toast) window.ClearLedger.toast("Demo reset to empty.");
        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 350);
      });
    }

    var clearBtn = qs("[data-clear-all]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!window.confirm("Clear all local data for this demo? This will remove the storage key and reseed on next load.")) return;
        storage.clearAll();
        if (window.ClearLedger.toast) window.ClearLedger.toast("Local demo data cleared.");
        window.setTimeout(function () {
          window.location.href = "index.html";
        }, 350);
      });
    }
  }

  window.ClearLedger.settingsPage = { init: initSettingsPage };
})();
