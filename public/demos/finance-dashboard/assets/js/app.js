(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

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
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function initThemeToggle() {
    var root = document.documentElement;
    var toggle = qs(".theme-toggle");
    if (!toggle) return;

    function prefersDark() {
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    function setTheme(next) {
      if (next) {
        root.setAttribute("data-theme", next);
        safeSet("theme", next);
      } else {
        root.removeAttribute("data-theme");
        safeRemove("theme");
      }
    }

    function syncState() {
      var mode = root.getAttribute("data-theme");
      var isDark = mode === "dark" || (!mode && prefersDark());
      toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    }

    function toggleTheme() {
      var mode = root.getAttribute("data-theme");
      var isDark = mode === "dark" || (!mode && prefersDark());
      setTheme(isDark ? "light" : "dark");
    }

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleTheme();
      syncState();
    });

    syncState();
  }

  function initMobileNav() {
    var menuToggle = qs(".menu-toggle");
    var navMenu = qs(".nav-links");
    if (!menuToggle || !navMenu) return;

    function closeMenu() {
      navMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      navMenu.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
    }

    menuToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.contains("open");
      if (isOpen) closeMenu();
      else openMenu();
    });

    document.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("open")) return;
      if (event.target.closest(".nav-links") || event.target.closest(".menu-toggle")) return;
      closeMenu();
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A") {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  function showStorageBanner(isReadOnly) {
    var banner = qs("[data-storage-banner]");
    if (!banner) return;
    banner.hidden = !isReadOnly;
  }

  function toast(message, actions) {
    var stack = qs("[data-toasts]");
    if (!stack) return;

    var el = document.createElement("div");
    el.className = "toast";

    var p = document.createElement("p");
    p.textContent = message;
    el.appendChild(p);

    if (actions && actions.length) {
      var actionsEl = document.createElement("div");
      actionsEl.className = "txn-actions";

      for (var i = 0; i < actions.length; i++) {
        (function (action) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "icon-button";
          btn.textContent = action.label;
          btn.addEventListener("click", function () {
            if (action.onClick) action.onClick();
            if (el && el.parentNode) el.parentNode.removeChild(el);
          });
          actionsEl.appendChild(btn);
        })(actions[i]);
      }

      el.appendChild(actionsEl);
    }

    stack.appendChild(el);

    window.setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 6500);
  }

  function initGlobal() {
    if (!window.ClearLedger) window.ClearLedger = {};
    window.ClearLedger.toast = toast;
  }

  function initPage() {
    if (!window.ClearLedger || !window.ClearLedger.storage) return;
    var result = window.ClearLedger.storage.load();
    showStorageBanner(result.readOnly);

    var page = document.body.getAttribute("data-page") || "";

    if (page === "dashboard" && window.ClearLedger.dashboard) {
      window.ClearLedger.dashboard.init(result.state, { seeded: result.seeded, readOnly: result.readOnly });
    }

    if (page === "transactions" && window.ClearLedger.transactionsPage) {
      window.ClearLedger.transactionsPage.init(result.state);
    }

    if (page === "budgets" && window.ClearLedger.budgetsPage) {
      window.ClearLedger.budgetsPage.init(result.state);
    }

    if (page === "settings" && window.ClearLedger.settingsPage) {
      window.ClearLedger.settingsPage.init(result.state);
    }
  }

  function init() {
    document.documentElement.classList.add("js");
    initThemeToggle();
    initMobileNav();
    initGlobal();
    initPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

