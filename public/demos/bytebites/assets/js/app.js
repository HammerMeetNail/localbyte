(function () {
  "use strict";

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initThemeToggle() {
    var toggle = qs(".theme-toggle");
    if (!toggle) return;

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
      } catch (e) {
      }
    }

    function getActiveTheme() {
      var attr = document.documentElement.getAttribute("data-theme");
      if (attr) return attr;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      return "light";
    }

    function setTheme(next) {
      document.documentElement.setAttribute("data-theme", next);
      toggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    }

    function sync() {
      var stored = getStoredTheme();
      var current = stored || getActiveTheme();
      setTheme(current);
    }

    toggle.addEventListener("click", function () {
      var current = getActiveTheme();
      var next = current === "dark" ? "light" : "dark";
      setStoredTheme(next);
      setTheme(next);
    });

    sync();
  }

  function initMenuToggle() {
    var toggle = qs(".menu-toggle");
    var menu = qs("#nav-menu");
    if (!toggle || !menu) return;

    function isOpen() {
      return menu.classList.contains("open");
    }

    function open() {
      menu.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }

    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (isOpen()) close();
      else open();
    });

    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      var target = e.target;
      if (toggle.contains(target)) return;
      if (menu.contains(target)) return;
      close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!isOpen()) return;
      close();
      toggle.focus();
    });

    qsa("#nav-menu a").forEach(function (link) {
      link.addEventListener("click", function () {
        close();
      });
    });
  }

  function initStorageBanner() {
    var banner = qs("[data-storage-banner]");
    if (!banner) return;
    if (!window.ByteBitesStorage) return;
    if (window.ByteBitesStorage.available) return;
    banner.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    initMenuToggle();
    initStorageBanner();
  });

  if (typeof window !== "undefined") {
    window.ByteBitesApp = {
      qs: qs,
      qsa: qsa
    };
  }
})();

