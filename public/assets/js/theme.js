(function () {
  var root = document.documentElement;

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

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
    }
  }

  var stored = safeGet("theme");
  if (stored) root.setAttribute("data-theme", stored);

  function setTheme(next) {
    if (next) {
      root.setAttribute("data-theme", next);
      safeSet("theme", next);
    } else {
      root.removeAttribute("data-theme");
      safeRemove("theme");
    }
  }

  function init() {
    var toggle = document.querySelector(".theme-toggle");
    var menuToggle = document.querySelector(".menu-toggle");
    var navMenu = document.querySelector(".nav-links");

    // Theme toggle functionality
    if (toggle) {
      function syncState() {
        var mode = root.getAttribute("data-theme");
        var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = mode === "dark" || (!mode && prefersDark);
        toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      }

      function toggleTheme() {
        var mode = root.getAttribute("data-theme");
        var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = mode === "dark" || (!mode && prefersDark);
        setTheme(isDark ? "light" : "dark");
      }

      toggle.addEventListener("click", function (e) {
        e.stopPropagation(); // Don't close mobile menu when toggling theme
        toggleTheme();
        syncState();
      });
      syncState();
    }

    // Mobile hamburger menu functionality
    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", function () {
        var isOpen = navMenu.classList.contains("open");
        navMenu.classList.toggle("open", !isOpen);
        menuToggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
      });

      // Close menu when clicking outside
      document.addEventListener("click", function (event) {
        if (navMenu.classList.contains("open") && !event.target.closest(".nav-links") && !event.target.closest(".menu-toggle")) {
          navMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });

      // Close menu when clicking a link (but not theme toggle)
      navMenu.addEventListener("click", function (event) {
        if (event.target.tagName === "A") {
          navMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });

      // Close menu on Escape key
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && navMenu.classList.contains("open")) {
          navMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  // Run init when DOM is ready, or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
