(function () {
  var root = document.documentElement;
  var storage = null;
  var themeMedia = getMedia("(prefers-color-scheme: dark)");
  var preference = null;

  function getMedia(query) {
    try {
      return window.matchMedia ? window.matchMedia(query) : null;
    } catch (e) {
      return null;
    }
  }

  function validTheme(value) {
    return value === "light" || value === "dark" ? value : null;
  }

  try {
    storage = window.localStorage;
    preference = validTheme(storage.getItem("theme"));
  } catch (e) {
  }

  function prefersDark() {
    return preference === "dark" || (!preference && themeMedia && themeMedia.matches);
  }

  function applyTheme() {
    if (preference) {
      root.setAttribute("data-theme", preference);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function observeMedia(media, listener) {
    if (!media) return false;
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return true;
    }
    if (media.addListener) {
      media.addListener(listener);
      return true;
    }
    return false;
  }

  applyTheme();

  function init() {
    var themeToggle = document.querySelector(".theme-toggle");
    var themeLabel = themeToggle && themeToggle.querySelector(".theme-label");
    var menuToggle = document.querySelector(".menu-toggle");
    var menuLabel = menuToggle && menuToggle.querySelector(".menu-label");
    var navMenu = document.querySelector(".nav-links");
    var menuMedia = getMedia("(max-width: 800px)");

    function syncTheme() {
      applyTheme();
      if (!themeToggle) return;
      var isDark = prefersDark();
      themeToggle.setAttribute("aria-label", "Dark mode");
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
      if (themeLabel) themeLabel.textContent = "Dark mode";
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        preference = prefersDark() ? "light" : "dark";
        try {
          if (storage) storage.setItem("theme", preference);
        } catch (e) {
        }
        syncTheme();
      });
    }

    observeMedia(themeMedia, syncTheme);
    window.addEventListener("storage", function (event) {
      if (event.key !== "theme" && event.key !== null) return;
      if (storage && event.storageArea && event.storageArea !== storage) return;
      preference = event.key === null ? null : validTheme(event.newValue);
      syncTheme();
    });
    syncTheme();

    if (!menuToggle || !navMenu) return;

    function isMobile() {
      return menuMedia ? menuMedia.matches : (window.innerWidth || root.clientWidth) <= 800;
    }

    function setMenu(open) {
      if (open) {
        navMenu.classList.add("open");
      } else {
        navMenu.classList.remove("open");
      }
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
    }

    function closeMenu(returnFocus) {
      if (isMobile() && (returnFocus || navMenu.contains(document.activeElement))) {
        menuToggle.focus();
      }
      setMenu(false);
    }

    function syncViewport() {
      if (isMobile()) {
        // Preserve access to the focused link when desktop navigation collapses.
        setMenu(navMenu.contains(document.activeElement));
      } else {
        setMenu(false);
        if (document.activeElement === menuToggle) {
          var firstLink = navMenu.querySelector("a[href]");
          if (firstLink) firstLink.focus();
        }
      }
    }

    menuToggle.addEventListener("click", function () {
      if (!isMobile()) return;
      if (navMenu.classList.contains("open")) {
        closeMenu(true);
      } else {
        setMenu(true);
        var firstLink = navMenu.querySelector("a[href]");
        if (firstLink) firstLink.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (navMenu.classList.contains("open") && !navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu(false);
      }
    });

    navMenu.addEventListener("click", function (event) {
      var target = event.target;
      while (target && target !== navMenu) {
        if (target.nodeType === 1 && target.tagName.toLowerCase() === "a") {
          closeMenu(false);
          return;
        }
        target = target.parentNode;
      }
    });

    document.addEventListener("keydown", function (event) {
      if ((event.key === "Escape" || event.keyCode === 27) && navMenu.classList.contains("open")) {
        event.preventDefault();
        closeMenu(true);
      }
    });

    if (!observeMedia(menuMedia, syncViewport)) {
      var wasMobile = isMobile();
      window.addEventListener("resize", function () {
        var mobile = isMobile();
        if (mobile !== wasMobile) {
          wasMobile = mobile;
          syncViewport();
        }
      });
    }
    syncViewport();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
