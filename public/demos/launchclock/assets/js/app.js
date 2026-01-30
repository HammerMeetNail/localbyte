(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
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
      if (event.target && event.target.tagName === "A") closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("open")) closeMenu();
    });
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(next) {
    try {
      if (!next) localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch (e) {}
  }

  function getPreferredTheme() {
    var stored = getStoredTheme();
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    setStoredTheme(next);
  }

  function initThemeToggle() {
    var toggle = qs(".theme-toggle");
    if (!toggle) return;

    var current = getPreferredTheme();
    setTheme(current);
    toggle.setAttribute("aria-pressed", current === "dark" ? "true" : "false");

    toggle.addEventListener("click", function () {
      var next = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
      setTheme(next);
      toggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    });
  }

  function showToast(opts) {
    var data = opts || {};
    var title = data.title || "Done";
    var message = data.message || "";
    var actions = data.actions || [];
    var durationMs = data.durationMs == null ? 5000 : data.durationMs;

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    var t = document.createElement("strong");
    t.textContent = title;
    toast.appendChild(t);

    if (message) {
      var m = document.createElement("div");
      m.className = "muted small";
      m.textContent = message;
      toast.appendChild(m);
    }

    if (actions.length) {
      var row = document.createElement("div");
      row.className = "toast-actions";
      actions.forEach(function (a) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "button secondary";
        btn.textContent = a.label || "Action";
        btn.addEventListener("click", function () {
          try { a.onClick && a.onClick(); } catch (e) {}
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
        row.appendChild(btn);
      });
      toast.appendChild(row);
    }

    document.body.appendChild(toast);

    if (durationMs > 0) {
      window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, durationMs);
    }
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error("clipboard unavailable"));
  }

  function selectInputForCopy(input) {
    try {
      input.focus();
      input.select();
    } catch (e) {}
  }

  function init() {
    document.documentElement.classList.add("js");
    initMobileNav();
    initThemeToggle();
  }

  var api = {
    qs: qs,
    qsa: qsa,
    safeJsonParse: safeJsonParse,
    showToast: showToast,
    copyTextToClipboard: copyTextToClipboard,
    selectInputForCopy: selectInputForCopy
  };

  window.LaunchClock = window.LaunchClock || {};
  Object.keys(api).forEach(function (k) {
    window.LaunchClock[k] = api[k];
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

