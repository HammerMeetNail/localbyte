(function () {
  var STORAGE_KEY = "cedarsteam.orderItems";

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
    }
  }

  function parseIds(value) {
    if (!value) return [];
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function uniq(ids) {
    var seen = {};
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      if (!id || seen[id]) continue;
      seen[id] = true;
      out.push(id);
    }
    return out;
  }

  function getCategoryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var raw = (params.get("category") || "").toLowerCase();
    if (!raw) return "all";
    return raw;
  }

  function setCategoryInUrl(category) {
    var params = new URLSearchParams(window.location.search);
    if (!category || category === "all") params.delete("category");
    else params.set("category", category);
    var next = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", next);
  }

  function initFiltering() {
    var filterGroup = document.querySelector("[data-menu-filters]");
    var itemsRoot = document.querySelector("[data-menu-items]");
    if (!filterGroup || !itemsRoot) return;

    var buttons = filterGroup.querySelectorAll("[data-category]");
    var items = itemsRoot.querySelectorAll("[data-category]");

    function apply(category) {
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var isActive = btn.getAttribute("data-category") === category;
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      }

      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        var match = category === "all" || item.getAttribute("data-category") === category;
        item.toggleAttribute("hidden", !match);
      }

      setCategoryInUrl(category);
    }

    var initial = getCategoryFromUrl();
    var allowed = { all: true, coffee: true, tea: true, pastries: true, seasonal: true };
    if (!allowed[initial]) initial = "all";
    apply(initial);

    filterGroup.addEventListener("click", function (event) {
      var target = event.target.closest("[data-category]");
      if (!target) return;
      var category = target.getAttribute("data-category");
      if (!allowed[category]) return;
      apply(category);
    });
  }

  function initAddButtons() {
    var toast = document.querySelector("[data-toast]");
    var addButtons = document.querySelectorAll("[data-add-item]");
    if (!addButtons.length) return;

    for (var i = 0; i < addButtons.length; i++) {
      addButtons[i].hidden = false;
    }

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      window.clearTimeout(showToast._t);
      showToast._t = window.setTimeout(function () {
        toast.hidden = true;
      }, 1800);
    }

    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-add-item]");
      if (!btn) return;
      var id = btn.getAttribute("data-add-item");
      if (!id) return;

      var ids = parseIds(safeGet(STORAGE_KEY));
      ids.push(id);
      ids = uniq(ids);
      safeSet(STORAGE_KEY, JSON.stringify(ids));
      showToast("Added to order inquiry. Open Order/Reserve to send.");
    });
  }

  function init() {
    initFiltering();
    initAddButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

