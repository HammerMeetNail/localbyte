(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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

  function initHeroParallax() {
    var hero = qs("[data-hero]");
    if (!hero) return;
    if (prefersReducedMotion()) return;

    var layer = qs("[data-hero-layer]", hero);
    if (!layer) return;

    var ticking = false;
    var lastY = 0;
    var isActive = true;

    function update() {
      ticking = false;
      if (!isActive) return;

      var shift = Math.max(-24, Math.min(24, Math.round(lastY * -0.08)));
      layer.style.setProperty("--hero-shift", shift + "px");
    }

    function onScroll() {
      lastY = window.scrollY || 0;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        isActive = !!(entries && entries[0] && entries[0].isIntersecting);
        if (isActive) onScroll();
      }, { rootMargin: "150px 0px 150px 0px" });
      observer.observe(hero);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function safeFetchJson(url) {
    if (!window.fetch) return Promise.reject(new Error("fetch unavailable"));
    return fetch(url, { credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error("bad response");
      return res.json();
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initInstagramFeed() {
    var feed = qs("[data-instagram-feed]");
    if (!feed) return;

    var note = qs("[data-feed-note]");
    var src = feed.getAttribute("data-src") || "";
    if (!src) return;

    safeFetchJson(src)
      .then(function (data) {
        if (!data || !data.posts || !data.posts.length) return;

        var html = "";
        for (var i = 0; i < data.posts.length; i++) {
          var post = data.posts[i];
          if (!post || !post.image || !post.alt) continue;
          var href = escapeHtml(post.href || "menu.html");
          var caption = escapeHtml(post.caption || "");

          html += ""
            + "<a class=\"feed-card\" href=\"" + href + "\">"
            + "<img src=\"" + escapeHtml(post.image) + "\" alt=\"" + escapeHtml(post.alt) + "\" loading=\"lazy\" width=\"800\" height=\"800\" />"
            + "<span class=\"feed-meta\">" + caption + "</span>"
            + "</a>";
        }
        if (html) feed.innerHTML = html;
      })
      .catch(function () {
        if (note) note.hidden = false;
      });
  }

  function init() {
    document.documentElement.classList.add("js");
    initMobileNav();
    initHeroParallax();
    initInstagramFeed();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
